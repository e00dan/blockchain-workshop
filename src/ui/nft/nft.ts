/* eslint-disable guard-for-in */
/* eslint-disable prefer-destructuring */
import { bytes } from '@ckb-lumos/codec';
import { utils, OutPoint } from '@ckb-lumos/lumos';
import { fetch } from './fetch';
import { CONFIG } from './config';
import {
    CkbIndexerCell,
    NFTCell,
    NFTCellConfigureFlags,
    NFTClassCellData,
    NFTIssuerCellData,
    NFTTypeArgs,
    SimpleRequestCache,
    Uint16BE
} from './nft-utils';

const CACHE = new SimpleRequestCache();

export class NFT {
    public nftClassCell?: CkbIndexerCell;

    public issuerCell?: CkbIndexerCell;

    constructor(
        public outpoint: OutPoint,
        public data: string,
        public typeScriptArguments: string
    ) {}

    get id() {
        return this.typeScriptArguments;
    }

    get outpointId() {
        return `${this.outpoint.tx_hash}#${this.outpoint.index}`;
    }

    getTypeScriptArguments() {
        return NFTTypeArgs.unpack(bytes.bytify(this.typeScriptArguments));
    }

    getData() {
        const data = NFTCell.unpack(bytes.bytify(this.data)); // { totalSupply: BI(21000000 * 10 ** 8), decimals: 8 }

        const configuredFlags = this.getConfigureFlags(data.configure);

        return { data, configuredFlags };
    }

    getClassData() {
        if (!this.nftClassCell) {
            throw new Error("Class cell hasn't been fetched yet.");
        }

        const fixedPart = this.nftClassCell.output_data.slice(0, 22);
        const data = NFTClassCellData.unpack(bytes.bytify(fixedPart));

        // read name
        const nameLengthParsed = Uint16BE.unpack(
            `0x${this.nftClassCell.output_data.slice(22, 26)}`
        );
        const name = Buffer.from(
            bytes.bytify(`0x${this.nftClassCell.output_data.slice(26, 26 + nameLengthParsed * 2)}`)
        ).toString('utf8');
        let lastReadIndex = 26 + nameLengthParsed * 2;

        // read description
        const descriptionLengthParsed = Uint16BE.unpack(
            `0x${this.nftClassCell.output_data.slice(lastReadIndex, lastReadIndex + 4)}`
        );
        const description = Buffer.from(
            bytes.bytify(
                `0x${this.nftClassCell.output_data.slice(
                    lastReadIndex + 4,
                    lastReadIndex + 4 + descriptionLengthParsed * 2
                )}`
            )
        ).toString('utf8');
        lastReadIndex = lastReadIndex + 4 + descriptionLengthParsed * 2;

        // read renderer
        const rendererLengthParsed = Uint16BE.unpack(
            `0x${this.nftClassCell.output_data.slice(lastReadIndex, lastReadIndex + 4)}`
        );
        const renderer = Buffer.from(
            bytes.bytify(
                `0x${this.nftClassCell.output_data.slice(
                    lastReadIndex + 4,
                    lastReadIndex + 4 + rendererLengthParsed * 2
                )}`
            )
        ).toString('utf8');

        return { ...data, name, description, renderer };
    }

    getIssuerData() {
        if (!this.issuerCell) {
            throw new Error("Issuer cell hasn't been fetched yet.");
        }

        const fixedPart = this.issuerCell.output_data.slice(0, 24);
        const data = NFTIssuerCellData.unpack(bytes.bytify(fixedPart));

        let info: string | undefined;
        let infoJSON: any;
        if (data.infoSize > 0) {
            info = Buffer.from(
                bytes.bytify(`0x${this.issuerCell.output_data.slice(24, 24 + data.infoSize * 2)}`)
            ).toString('utf8');

            if (info.length > 0) {
                try {
                    infoJSON = JSON.parse(info);
                } catch (error) {
                    infoJSON = {};
                }
            } else {
                infoJSON = {};
            }
        }

        return { ...data, info: infoJSON };
    }

    getConfigureFlags(configureFlagMap: number): NFTCellConfigureFlags[] {
        const flags: NFTCellConfigureFlags[] = [];

        let flag: keyof typeof NFTCellConfigureFlags;
        for (flag in NFTCellConfigureFlags) {
            const value = NFTCellConfigureFlags[flag] as string | number;

            if (typeof value === 'string') {
                continue;
            }

            if ((2 ** value) & configureFlagMap) {
                flags.push(value);
            }
        }

        return flags;
    }

    async getConnectedClass() {
        if (this.nftClassCell) {
            return;
        }

        const cellsFilter = [
            {
                script: {
                    code_hash: CONFIG.MNFT_CLASS_TYPE_CODE_HASH,
                    hash_type: 'type',
                    args: this.typeScriptArguments.slice(0, 50)
                },
                script_type: 'type'
            },
            'asc',
            '0x64'
        ];
        const cacheKey = `get_cells${JSON.stringify(cellsFilter)}`;

        let result = CACHE.loadRequest(cacheKey);
        if (!result) {
            const requestBody = {
                id: 2,
                jsonrpc: '2.0',
                method: 'get_cells',
                params: cellsFilter
            };
            console.log('fetch', CONFIG.CKB_INDEXER_RPC_URL);
            const response = await fetch(CONFIG.CKB_INDEXER_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            result = await response.json();

            CACHE.saveRequest(cacheKey, result);
        }

        if (result.result.objects.length !== 1) {
            throw new Error("Can't find single NFT Class Cell.");
        }

        this.nftClassCell = result.result.objects[0];
    }

    async getConnectedIssuer(): Promise<void> {
        if (this.issuerCell) {
            return;
        }

        const typeArgs = this.getTypeScriptArguments();

        const cellsFilter = [
            {
                script: {
                    code_hash: CONFIG.MNFT_ISSUER_TYPE_CODE_HASH,
                    hash_type: 'type',
                    args: '0x'
                },
                script_type: 'type'
            },
            'asc',
            '0x512'
        ];
        const cacheKey = `get_cells${JSON.stringify(cellsFilter)}`;

        let result = CACHE.loadRequest(cacheKey);

        if (!result) {
            const requestBody = {
                id: 2,
                jsonrpc: '2.0',
                method: 'get_cells',
                params: cellsFilter
            };
            const response = await fetch(CONFIG.CKB_INDEXER_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });
            result = await response.json();
            CACHE.saveRequest(cacheKey, result);
        }

        for (const currentIssuerCell of result.result.objects) {
            const scriptHash = utils.computeScriptHash(currentIssuerCell.output.type);
            const scriptHashBeginning = scriptHash.slice(0, 42);

            if (scriptHashBeginning === typeArgs.issuerId) {
                this.issuerCell = currentIssuerCell as CkbIndexerCell;
                break;
            }
        }

        if (!this.issuerCell) {
            throw new Error("Can't find mNFT Issuer cell.");
        }
    }
}

export type EnrichedMNFT = {
    tokenId: string;
    name: string;
    renderer: string;
    issuerName: string;
    token: NFT;
};

export type TransactionBuilderExpectedMNFTData = {
    classTypeArgs: string;
    nftTypeArgs: string;
    tokenId: string;
    outPoint: {
        txHash: string;
        index: string;
    };
};

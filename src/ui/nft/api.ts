import { OutPoint, Output } from '@ckb-lumos/lumos';
import { Address } from '@lay2/pw-core';

import { fetch } from './fetch';
import { CONFIG } from './config';
import { NFT } from './nft';

export type CkbIndexerCell = {
    block_number: string;
    out_point: OutPoint;
    output: Output;
    output_data: string;
    tx_index: string;
};

export async function getNFTsAtAddress(address: Address) {
    console.log(`Searching for mNFTs at address: ${address.toCKBAddress()}`);
    const addressLockScript = address.toLockScript().serializeJson();
    const response = await fetch(CONFIG.CKB_INDEXER_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: 2,
            jsonrpc: '2.0',
            method: 'get_cells',
            params: [
                {
                    script: addressLockScript,
                    script_type: 'lock'
                },
                'asc',
                '0x64'
            ]
        })
    });
    const result = await response.json();

    return (result.result.objects as CkbIndexerCell[])
        .filter(o => o.output.type?.code_hash === CONFIG.MNFT_TYPE_CODE_HASH)
        .map(o => {
            if (!o.output.type) {
                throw new Error('NFT has missing Type Script arguments.');
            }

            console.log(o);

            return new NFT(o.out_point, o.output_data, o.output.type?.args);
        });
}

/* eslint-disable @typescript-eslint/camelcase */
import Web3 from 'web3';
import { toBuffer, toChecksumAddress } from 'ethereumjs-util';
import { recoverTypedSignature_v4, TypedDataUtils, signTypedData } from 'eth-sig-util';
import { HeadTail } from './types/HeadTail';
import * as HeadTailJSON from '../build/contracts/HeadTail.json';

const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
];

export async function deployHeadTailContract(web3: Web3, account: string): Promise<HeadTail> {
    const HeadTailContract: HeadTail = new web3.eth.Contract(HeadTailJSON.abi as any) as any;

    return (HeadTailContract.deploy({
        data: HeadTailJSON.bytecode,
        arguments: []
    }).send({
        from: account,
        gas: 6000000,
        gasPrice: '0'
    }) as any) as HeadTail;
}

export async function useExistingHeadTailContract(web3: Web3, address: string): Promise<HeadTail> {
    const HeadTailContract: HeadTail = new web3.eth.Contract(
        HeadTailJSON.abi as any,
        address
    ) as any;

    return HeadTailContract;
}

export async function domainSeparator(
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string
) {
    return `0x${TypedDataUtils.hashStruct(
        'EIP712Domain',
        { name, version, chainId, verifyingContract },
        { EIP712Domain }
    ).toString('hex')}`;
}

function getSigningData(
    choice: boolean,
    secret: string,
    chainId: number,
    verifyingContractAddress: string
) {
    return {
        types: {
            EIP712Domain,
            Mail: [
                { name: 'choice', type: 'bool' },
                {
                    name: 'secret',
                    type: 'string'
                }
            ]
        },
        domain: {
            name: 'HeadTail',
            version: '1',
            chainId,
            verifyingContract: verifyingContractAddress
        },
        primaryType: 'Mail' as const,
        message: {
            choice,
            secret
        }
    };
}

export async function createChoiceSignature(
    accountAddress: string,
    choice: boolean,
    secret: string,
    chainId: number,
    verifyingContractAddress: string,
    web3: Web3,
    privateKey?: string
): Promise<any> {
    const IS_GANACHE = !(web3.currentProvider as any).sendAsync;

    const signingData = getSigningData(choice, secret, chainId, verifyingContractAddress);
    const params = [accountAddress, IS_GANACHE ? signingData : JSON.stringify(signingData)];
    const method = IS_GANACHE ? 'eth_signTypedData' : 'eth_signTypedData_v4';

    if (privateKey) {
        const signedChoiceHash = signTypedData(toBuffer(privateKey), { data: signingData });

        return {
            signedChoiceHash
        };
    }
    if (IS_GANACHE) {
        Web3.providers.HttpProvider.prototype.sendAsync =
            Web3.providers.HttpProvider.prototype.send;
    }
    return new Promise(resolve => {
        (web3.currentProvider as any).sendAsync(
            {
                method,
                params,
                accountAddress
            },
            function sendAsyncCallback(err: any, result: any) {
                if (err) return console.dir(err);
                if (result.error) {
                    console.error(result.error.message);
                }
                if (result.error) return console.error('ERROR', result);
                console.log(`TYPED SIGNED:${JSON.stringify(result.result)}`);

                const recovered = recoverTypedSignature_v4({
                    data: signingData,
                    sig: result.result
                });

                if (toChecksumAddress(recovered) === toChecksumAddress(accountAddress)) {
                    console.log(`Successfully recovered signer as ${accountAddress}`);
                } else {
                    console.log(
                        `Failed to verify signer when comparing ${result} to ${accountAddress}`
                    );
                }

                return resolve({
                    signedChoiceHash: result.result
                });
            }
        );
    });
}

export async function createChoiceSignaturePK(
    choice: boolean,
    secret: string,
    chainId: number,
    verifyingContractAddress: string,
    privateKey?: string
) {
    if (!privateKey) {
        throw new Error(
            'Private key is required for creating choice signature using "createChoiceSignaturePK" method.'
        );
    }

    const signingData = getSigningData(choice, secret, chainId, verifyingContractAddress);
    const signedChoiceHash = signTypedData(toBuffer(privateKey), { data: signingData });

    return {
        signedChoiceHash
    };
}

export async function getEthAccounts(): Promise<string[]> {
    const accounts = (await (window as any).ethereum.send('eth_requestAccounts')).result;

    return accounts;
}

export async function getCurrentEthAccount(): Promise<string> {
    const accounts = await getEthAccounts();

    if (accounts.length === 0) {
        throw new Error('No metamask accounts found!');
    }

    return accounts[0];
}

let currentAddress: string | undefined;

export async function currentEthAddress(): Promise<string> {
    if (!currentAddress) {
        currentAddress = await getCurrentEthAccount();
    }
    return currentAddress;
}

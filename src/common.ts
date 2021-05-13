import Web3 from 'web3';
import { fromRpcSig, toRpcSig } from 'ethereumjs-util';
import { Hash, HexString } from '@ckb-lumos/base';
import { HeadTail } from './types/HeadTail';
import * as HeadTailJSON from '../build/contracts/HeadTail.json';

const DEPOSIT_AMOUNT = BigInt(1 * 10 ** 18).toString();

export async function deployHeadTailContract(
    web3: Web3,
    account: string,
    choiceHash: string,
    value: string = DEPOSIT_AMOUNT
): Promise<HeadTail> {
    const HeadTailContract: HeadTail = new web3.eth.Contract(HeadTailJSON.abi as any) as any;

    return (HeadTailContract.deploy({
        data: HeadTailJSON.bytecode,
        arguments: [choiceHash, value]
    }).send({
        from: account,
        value,
        gas: 6000000
    }) as any) as HeadTail;
}

export function createChoiceHash(choice: boolean, secret: string, web3: Web3) {
    return web3.utils.soliditySha3(choice, secret);
}

export async function createChoiceSignature(
    accountAddress: string,
    choice: boolean,
    secret: string,
    web3: Web3
) {
    const choiceHash = createChoiceHash(choice, secret, web3);

    const signed = await web3.eth.sign(choiceHash, accountAddress);

    const { v, r, s } = fromRpcSig(signed);

    const signedChoiceHash = toRpcSig(v, r, s);

    return {
        choiceHash,
        signedChoiceHash,
        v,
        r,
        s
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

export async function sign(web3: Web3, message: HexString): Promise<HexString> {
    // const account: string = await getCurrentEthAccount();
    // console.log('SIGN using account:', account);

    return '0x'.padEnd(132, '0');
}

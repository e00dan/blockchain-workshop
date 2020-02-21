import Web3 from 'web3';
import { fromRpcSig, toRpcSig } from 'ethereumjs-util';
import { HeadTail } from './types/HeadTail';
import * as HeadTailJSON from '../build/contracts/HeadTail.json';

const oneEther = BigInt(1 * 10 ** 18).toString();

export async function deployHeadTailContract(
    web3: Web3,
    account: string,
    choiceHash: string,
    value: string = oneEther
): Promise<HeadTail> {
    const HeadTailContract: HeadTail = new web3.eth.Contract(HeadTailJSON.abi as any) as any;

    return HeadTailContract.deploy({
        data: HeadTailJSON.bytecode,
        arguments: [choiceHash]
    }).send({
        from: account,
        value,
        gas: 6000000
    });
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

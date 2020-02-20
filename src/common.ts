import Web3 from 'web3';
import { setupLoader } from '@openzeppelin/contract-loader';
import { fromRpcSig, toRpcSig } from 'ethereumjs-util';
import { HeadTail } from './types/HeadTail';

const oneEther = BigInt(1 * 10 ** 18).toString();

export async function deployHeadTailContract(
    web3: Web3,
    defaultSender: string,
    choiceHash: string,
    value: string = oneEther
): Promise<HeadTail> {
    const loader = setupLoader({
        provider: web3,
        defaultSender,
        defaultGasPrice: 0
    }).web3;

    const HeadTailContract: HeadTail = loader.fromArtifact('HeadTail');

    return HeadTailContract.deploy({
        data: '',
        arguments: [choiceHash]
    }).send({
        from: defaultSender,
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

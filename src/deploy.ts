import Web3 from 'web3';
import { setupLoader } from '@openzeppelin/contract-loader';
import { HeadTail } from './types/HeadTail';

const oneEther = BigInt(1 * 10 ** 18).toString();

export async function deployHeadTailContract(
    web3: Web3,
    defaultSender: string,
    choice: boolean,
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
        arguments: [choice]
    }).send({
        from: defaultSender,
        value,
        gas: 6000000
    });
}

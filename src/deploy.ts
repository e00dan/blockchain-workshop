import Web3 from 'web3';
import { setupLoader } from '@openzeppelin/contract-loader';
import { HeadTail } from './types/HeadTail';

export async function deployHeadTailContract(web3: Web3, defaultSender: string): Promise<HeadTail> {
    const loader = setupLoader({
        provider: web3,
        defaultSender,
        defaultGasPrice: 0
    }).web3;

    const HeadTailContract: HeadTail = loader.fromArtifact('HeadTail');

    return HeadTailContract.deploy({
        data: '',
        arguments: []
    }).send({
        from: defaultSender,
        gas: 6000000
    });
}

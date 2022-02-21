import { providers } from 'ethers';
import { HeadTail__factory } from '../typechain-types';

export async function deployHeadTailContract(rpc: providers.JsonRpcProvider, from: string) {
    const signer = rpc.getSigner(from);
    const factory = new HeadTail__factory(signer);

    return factory.deploy();
}

import { Signer } from 'ethers';
import { HeadTail__factory } from '../typechain-types';

export async function deployHeadTailContract(signer: Signer) {
    const factory = new HeadTail__factory(signer);

    return factory.deploy({
        gasPrice: 0,
        gasLimit: 6000000
    });
}

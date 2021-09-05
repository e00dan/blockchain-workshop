import Web3 from 'web3';
import { HeadTail } from './types/HeadTail';
import * as HeadTailJSON from '../build/contracts/HeadTail.json';

export async function deployHeadTailContract(web3: Web3, account: string): Promise<HeadTail> {
    const HeadTailContract: HeadTail = new web3.eth.Contract(HeadTailJSON.abi as any) as any;

    return (HeadTailContract.deploy({
        data: HeadTailJSON.bytecode,
        arguments: []
    }).send({
        from: account,
        gas: 6000000
    }) as any) as HeadTail;
}

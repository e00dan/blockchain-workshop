import Web3 from 'web3';
import { HeadTail } from './types/HeadTail';
import * as HeadTailJSON from '../build/contracts/HeadTail.json';

const oneEther = BigInt(1 * 10 ** 18).toString();

export async function deployHeadTailContract(
    web3: Web3,
    defaultSender: string,
    choice: boolean,
    value: string = oneEther
): Promise<HeadTail> {
    const HeadTailContract: HeadTail = new web3.eth.Contract(HeadTailJSON.abi as any) as any;

    return HeadTailContract.deploy({
        data: HeadTailJSON.bytecode,
        arguments: [choice]
    }).send({
        from: defaultSender,
        value,
        gas: 6000000
    });
}

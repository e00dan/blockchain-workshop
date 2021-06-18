/* eslint-disable prefer-destructuring */
import Web3 from 'web3';
// import { Hash } from '@ckb-lumos/base';
import { HeadTail } from '../../types/HeadTail';
import * as HeadTailJSON from '../../../build/contracts/HeadTail.json';
// import {
//     deployContract,
//     executeL2Transaction,
//     submitL2Transaction
// } from '../polyjuice/polyjuice_actions';
// import { RunResult } from '../godwoken';

const DEPOSIT_AMOUNT = BigInt(1 * 10 ** 18).toString();

const DEFAULT_CALL_OPTIONS = {
    gasPrice: '0'
};

const DEFAULT_SEND_OPTIONS = {
    gasPrice: '0'
};
export class HeadTailPolyjuice {
    web3: Web3;

    contract: HeadTail;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(HeadTailJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getUserOneAddress(fromAddress: string) {
        const data = await this.contract.methods.userOneAddress().call({ from: fromAddress });

        return data;
    }

    async getUserTwoAddress(fromAddress: string) {
        const data = await this.contract.methods.userTwoAddress().call({ from: fromAddress });

        return data;
    }

    async getStake(fromAddress: string) {
        const data = await this.contract.methods.stake().call({ from: fromAddress });

        return BigInt(data);
    }

    async depositUserOne(choiceHash: string, value: string = DEPOSIT_AMOUNT, fromAddress: string) {
        const data = await this.contract.methods.depositUserOne(choiceHash, value).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            value,
            gas: 5000000
        });

        return data;
    }

    async depositUserTwo(choice: boolean, value: string, fromAddress: string) {
        const data = await this.contract.methods.depositUserTwo(choice).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            value,
            gas: 5000000
        });

        return data;
    }

    async verify(choice: boolean, secret: string, signedHash: string, fromAddress: string) {
        const data = await this.contract.methods.verify([choice, secret], signedHash).call({
            ...DEFAULT_CALL_OPTIONS,
            from: fromAddress,
            gas: 5000000
        });

        return data;
    }

    async revealUserOneChoice(choice: boolean, secret: string, fromAddress: string) {
        const data = await this.contract.methods.revealUserOneChoice(choice, secret).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            gas: 5000000
        });

        return data;
    }

    async deploy(fromAddress: string) {
        const _contract = (await (this.contract
            .deploy({
                data: HeadTailJSON.bytecode,
                arguments: []
            })
            .send({
                from: fromAddress,
                gas: 6000000,
                gasPrice: '0'
            }) as any)) as HeadTail;

        this.useDeployed(_contract.options.address);

        return _contract;
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}

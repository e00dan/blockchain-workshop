/* eslint-disable prefer-destructuring */
import Web3 from 'web3';
import { Hash } from '@ckb-lumos/base';
import { HeadTail } from '../../types/HeadTail';
import * as HeadTailJSON from '../../../build/contracts/HeadTail.json';
import {
    deployContract,
    executeL2Transaction,
    submitL2Transaction
} from '../polyjuice/polyjuice_actions';
import { RunResult } from '../godwoken';

const DEPOSIT_AMOUNT = BigInt(1 * 10 ** 18).toString();

export class HeadTailPolyjuice {
    web3: Web3;

    contract: HeadTail;

    contractAccountId: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(HeadTailJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.contractAccountId);
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
            from: fromAddress,
            value,
            gas: 5000000
        });

        return data;
    }

    async depositUserTwo(choice: boolean, value: string, fromAddress: string) {
        const data = await this.contract.methods.depositUserTwo(choice).send({
            from: fromAddress,
            value,
            gas: 5000000
        });

        return data;
    }

    async createChoiceHash(choice: boolean, secret: string, fromAddress: string) {
        const data = await this.contract.methods.createChoiceHash(choice, secret).call({
            from: fromAddress,
            gas: 5000000
        });

        return data;
    }

    async verify(hash: string, signedHash: string, fromAddress: string) {
        const data = await this.contract.methods.verify(hash, signedHash).call({
            from: fromAddress,
            gas: 5000000
        });

        return data;
    }

    async revealUserOneChoice(choice: boolean, secret: string, fromAddress: string) {
        const data = await this.contract.methods.revealUserOneChoice(choice, secret).send({
            from: fromAddress,
            gas: 5000000
        });

        return data;
    }

    async deploy(choiceHash: string, value: string = DEPOSIT_AMOUNT, fromAccountId: number) {
        // const abiData = this.contract
        //     .deploy({
        //         data: HeadTailJSON.bytecode,
        //         arguments: [choiceHash, value]
        //     })
        //     .encodeABI();

        // const sudtId = 1;
        // const creatorAccountId = 4;

        // console.log('Deploy SimpleStorage Parmas:', {
        //     sudtId,
        //     creatorAccountId,
        //     fromId: fromAccountId,
        //     toId: 0,
        //     value,
        //     data: abiData
        // });

        // let deployResult: [RunResult, Hash, number] | undefined;
        // try {
        //     deployResult = await deployContract(
        //         this.web3,
        //         +sudtId,
        //         +creatorAccountId,
        //         fromAccountId,
        //         BigInt(value),
        //         abiData
        //     );
        // } catch (e) {
        //     alert(e.message);
        //     throw e;
        // }

        // const runResult: RunResult = deployResult![0];
        // const deployedScriptHash = deployResult![1];

        // this.contractAccountId = deployResult[2];

        // const errorMessage: string | undefined = (runResult as any).message;
        // if (errorMessage !== undefined && errorMessage !== null) {
        //     alert(errorMessage);
        // } else {
        //     console.log(`Contract deployed.`, {
        //         deployedScriptHash,
        //         contractAccountId: this.contractAccountId
        //     });
        // }
    }

    async useDeployed(contractAccountId: string) {
        this.contractAccountId = contractAccountId;
        this.contract.options.address = contractAccountId;
    }
}

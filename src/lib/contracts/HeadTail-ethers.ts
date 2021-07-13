/* eslint-disable prefer-destructuring */
import { Contract, ContractFactory, Signer, providers } from 'ethers';
import * as HeadTailJSON from '../../../build/contracts/HeadTail.json';
import { CONFIG } from '../../config';

const DEPOSIT_AMOUNT = BigInt(1 * 10 ** 18).toString();

const DEFAULT_SEND_OPTIONS = {
    gasPrice: '0'
};
export class HeadTailPolyjuiceEthers {
    web3: providers.Provider;

    contract: Contract;

    factory: ContractFactory;

    address: string;

    constructor(web3: providers.Provider, signer: Signer) {
        this.web3 = web3;
        this.factory = new ContractFactory(HeadTailJSON.abi, HeadTailJSON.bytecode, signer);
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getUserOneAddress() {
        return this.contract.userOneAddress();
    }

    async getUserTwoAddress() {
        return this.contract.userTwoAddress();
    }

    async getStake() {
        const data = await this.contract.stake();

        return BigInt(data);
    }

    async depositUserOne(choiceHash: string, value: string = DEPOSIT_AMOUNT) {
        return (
            await this.contract.depositUserOne(choiceHash, value, {
                ...DEFAULT_SEND_OPTIONS,
                value
            })
        ).wait();
    }

    async depositUserTwo(choice: boolean, value: string) {
        return (
            await this.contract.depositUserTwo(choice, {
                ...DEFAULT_SEND_OPTIONS,
                value
            })
        ).wait();
    }

    async verify(choice: boolean, secret: string, signedHash: string) {
        return this.contract.verify([choice, secret], signedHash);
    }

    async verifyUpdated(
        choice: boolean,
        secret: string,
        signedHash: string,
        codeHash: string = CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH
    ) {
        return this.contract.verifyUpdated([choice, secret], signedHash, codeHash);
    }

    async revealUserOneChoice(choice: boolean, secret: string, fromAddress: string) {
        const data = await this.contract.methods.revealUserOneChoice(choice, secret).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            gas: 5000000
        });

        return data;
    }

    async deploy() {
        const tx = this.factory.getDeployTransaction();
        tx.gasPrice = 0;
        tx.gasLimit = 6_000_000;

        const txResponse = await this.factory.signer.sendTransaction(tx);
        const receipt = await txResponse.wait();

        this.useDeployed(receipt.contractAddress);

        return this.contract;
    }

    useDeployed(contractAddress = '') {
        this.address = contractAddress.trim();
        this.contract = this.factory.attach(this.address);
    }
}

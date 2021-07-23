import Web3 from 'web3';
import * as SimpleStorageJSON from '../../../build/contracts/SimpleStorage.json';
import { SimpleStorage } from '../../types/SimpleStorage';

export class SimpleStorageWrapper {
    web3: Web3;

    contract: SimpleStorage;

    address: string;

    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(SimpleStorageJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getStoredValue(fromAddress: string) {
        const data = await this.contract.methods.get().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async setStoredValue(value: number, fromAddress: string) {
        const tx = await this.contract.methods.set(value).send({
            from: fromAddress
        });

        return tx;
    }

    async deploy(fromAddress: string) {
        const contract = await (this.contract
            .deploy({
                data: SimpleStorageJSON.bytecode,
                arguments: []
            })
            .send({
                from: fromAddress
            } as any) as any);

        this.useDeployed(contract._address);
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}

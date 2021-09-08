import * as SimpleStorageJSON from './SimpleStorage.json';

const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
};

export class SimpleStorageWrapper {
    web3;

    contract;

    address;

    constructor(web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(SimpleStorageJSON.abi);
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getStoredValue(fromAddress) {
        const data = await this.contract.methods.get().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async setStoredValue(value, fromAddress) {
        const tx = await this.contract.methods.set(value).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            value
        });

        return tx;
    }

    async deploy(fromAddress) {
        const tx = this.contract
            .deploy({
                data: SimpleStorageJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress
            });

        let transactionHash = null;
        tx.on('transactionHash', (hash) => {
            transactionHash = hash;
        });

        const contract = await tx;

        this.useDeployed(contract.options.address);

        return transactionHash;
    }

    useDeployed(contractAddress) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
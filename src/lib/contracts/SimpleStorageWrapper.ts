import { Signer } from 'ethers';
import { SimpleStorage, SimpleStorage__factory } from '../../../typechain-types';

export class SimpleStorageWrapper {
    contract: SimpleStorage | undefined;

    constructor(public signer: Signer) {}

    get address() {
        return this.contract?.address;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async getStoredValue() {
        const data = await this.contract.get();

        return data.toNumber();
    }

    async setStoredValue(value: number) {
        const tx = await this.contract.set(value, {
            gasLimit: 1000000
        });

        return tx;
    }

    async deploy() {
        this.contract = await new SimpleStorage__factory().connect(this.signer).deploy({
            gasLimit: 1000000
        });
    }

    useDeployed(contractAddress: string) {
        this.contract = SimpleStorage__factory.connect(contractAddress, this.signer);
    }
}

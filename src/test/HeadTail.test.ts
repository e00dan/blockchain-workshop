import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import { providers, Signer, Wallet } from 'ethers';

import { HeadTail } from '../../typechain-types';
import { deployHeadTailContract } from '../common';
import { CONFIG } from '../config';

describe('HeadTail', () => {
    let rpc: providers.JsonRpcProvider;
    let signer: Signer;
    let contract: HeadTail;

    before(async () => {
        rpc = new providers.JsonRpcProvider(CONFIG.WEB3_PROVIDER_URL);
        const PRIVATE_KEY = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
        const wallet = new Wallet(PRIVATE_KEY);

        signer = wallet.connect(rpc);
    });

    beforeEach(async () => {
        contract = await deployHeadTailContract(signer);
    });

    // You may want to delete "Setup test" completely when you start work on implementing Stage 1 specification
    describe('Setup test', () => {
        it('deploys contract', () => {
            expect(contract.address).to.be.lengthOf(42);
        });

        it('has a valid starting counter() value', async () => {
            const initialCounter = (await contract.counter()).toBigInt();
            expect(initialCounter).to.be.equal(BigInt(1));
        });
    });

    describe('Stage 1', () => {
        // it('allows to deposit 1 ETH', async () => {
        //     const account = accounts[0];

        //     const startingBalance = (await rpc.getBalance(account)).toBigInt();

        //     console.log({
        //         startingBalance
        //     });

        //     const oneEther = BigInt(1 * 10 ** 18);

        //     await contract.deposit({
        //         value: Number(oneEther)
        //     });

        //     const finalBalance = (await rpc.getBalance(account)).toBigInt();
        //     expect(finalBalance).to.be.equal(startingBalance - oneEther);
        // });

        // it('saves address of user', async () => {
        //     const account = accounts[0];

        //     const oneEther = BigInt(1 * 10 ** 18);

        //     await contract.deposit({
        //         value: Number(oneEther)
        //     });

        //     expect(await contract.userAddress()).to.be.equal(account);
        // });
    });
});

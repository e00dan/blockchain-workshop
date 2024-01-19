import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import { providers } from 'ethers';

import { HeadTail } from '../../typechain-types';
import { deployHeadTailContract } from '../common';
import { CONFIG } from '../config';

describe('HeadTail', () => {
    let rpc: providers.JsonRpcProvider;
    let accounts: string[];
    let contract: HeadTail;

    before(async () => {
        rpc = new providers.JsonRpcProvider(CONFIG.WEB3_PROVIDER_URL);
        accounts = await rpc.listAccounts();
    });

    beforeEach(async () => {
        contract = await deployHeadTailContract(rpc, accounts[0]);
    });

    // You may want to delete "Setup test" completely when you start work on implementing Stage 1 specification
    describe('Setup test', () => {
        it('is possible to deploy a starting contract with counter', async () => {
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

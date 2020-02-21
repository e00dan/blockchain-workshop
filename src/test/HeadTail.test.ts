import { describe, beforeEach } from 'mocha';
import { expect } from 'chai';
import Web3 from 'web3';

import { HeadTail } from '../types/HeadTail';
import { deployHeadTailContract } from '../common';
import { CONFIG } from '../config';

const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

describe('HeadTail', () => {
    let web3: Web3;
    let accounts: string[];
    let contract: HeadTail;

    before(async () => {
        web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);
        accounts = await web3.eth.getAccounts();
    });

    beforeEach(async () => {
        contract = await deployHeadTailContract(web3, accounts[0]);
    });

    describe('Stage 1', () => {
        it('allows to deposit 1 ETH', async () => {
            const account = accounts[0];

            const startingBalance = BigInt(await web3.eth.getBalance(account));

            const oneEther = BigInt(1 * 10 ** 18);

            await contract.methods.depositUserOne(true).send({
                from: account,
                value: oneEther.toString()
            });

            expect(await web3.eth.getBalance(account)).to.be.equal(
                (startingBalance - oneEther).toString()
            );
        });

        it('saves address of user', async () => {
            const account = accounts[0];

            const oneEther = BigInt(1 * 10 ** 18);

            await contract.methods.depositUserOne(true).send({
                from: account,
                value: oneEther.toString()
            });

            expect(await contract.methods.userOneAddress().call()).to.be.equal(account);
        });

        it('does not save address of user if deposited value is below 1 ether', async () => {
            const oneEther = BigInt(1 * 10 ** 18);
            const account = accounts[0];

            await contract.methods.depositUserOne(true).send({
                from: account,
                value: (oneEther - BigInt(1)).toString()
            });

            expect(await contract.methods.userOneAddress().call()).to.be.equal(EMPTY_ADDRESS);
        });

        // it('reverts when trying to deposit less than 1 ether and sends it back to sender', async () => {

        // });
    });

    describe('Stage 2', () => {
        it('allows to save both users addresses', async () => {
            const userOne = accounts[0];
            const userTwo = accounts[1];

            const oneEther = BigInt(1 * 10 ** 18);

            await contract.methods.depositUserOne(true).send({
                value: oneEther.toString(),
                from: userOne
            });

            expect(await contract.methods.userOneAddress().call()).to.be.equal(userOne);

            await contract.methods.depositUserTwo(true).send({
                value: oneEther.toString(),
                from: userTwo
            });

            expect(await contract.methods.userTwoAddress().call()).to.be.equal(userTwo);
        });
    });
});

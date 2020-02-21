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

    const getBalance = async (account: string) => BigInt(await web3.eth.getBalance(account));
    const getBalanceAsString = async (account: string) => (await getBalance(account)).toString();

    beforeEach(async () => {
        contract = await deployHeadTailContract(web3, accounts[0]);
    });

    describe('Stage 1', () => {
        it('allows to deposit 1 ETH', async () => {
            const account = accounts[0];

            const startingBalance = BigInt(await web3.eth.getBalance(account));

            const oneEther = BigInt(1 * 10 ** 18);

            await contract.methods.deposit().send({
                from: account,
                value: oneEther.toString()
            });

            expect(await getBalanceAsString(account)).to.be.equal(
                (startingBalance - oneEther).toString()
            );
        });

        it('saves address of user', async () => {
            const account = accounts[0];

            const oneEther = BigInt(1 * 10 ** 18);

            await contract.methods.deposit().send({
                from: account,
                value: oneEther.toString()
            });

            expect(await contract.methods.depositingUserAddress().call()).to.be.equal(account);
        });

        it('does not save address of user if deposited value is below 1 ether', async () => {
            const oneEther = BigInt(1 * 10 ** 18);
            const account = accounts[0];

            await contract.methods.deposit().send({
                from: account,
                value: (oneEther - BigInt(1)).toString()
            });

            expect(await contract.methods.depositingUserAddress().call()).to.be.equal(
                EMPTY_ADDRESS
            );
        });

        // it('reverts when trying to deposit less than 1 ether and sends it back to sender', async () => {

        // });
    });
});

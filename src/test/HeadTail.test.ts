import { describe } from 'mocha';
import { expect } from 'chai';
import Web3 from 'web3';

import { CONFIG } from '../config';
import { deployHeadTailContract } from '../deploy';

describe('HeadTail', () => {
    let web3: Web3;
    let accounts: string[];

    before(async () => {
        web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);
        accounts = await web3.eth.getAccounts();
    });

    describe('Stage 1', () => {
        it('allows to deposit 1 ETH', async () => {
            const account = accounts[0];

            const startingBalance = BigInt(await web3.eth.getBalance(account));

            const oneEther = BigInt(1 * 10 ** 18);

            await deployHeadTailContract(web3, accounts[0], true);

            expect(await web3.eth.getBalance(account)).to.be.equal(
                (startingBalance - oneEther).toString()
            );
        });

        it('saves address of user', async () => {
            const account = accounts[0];

            const contract = await deployHeadTailContract(web3, accounts[0], true);

            expect(await contract.methods.userOneAddress().call()).to.be.equal(account);
        });

        it('reverts when trying to deposit less than 1 ether', async () => {
            let errorThrown = false;

            try {
                await deployHeadTailContract(web3, accounts[0], true, '1');
            } catch (error) {
                errorThrown = true;
                expect(error.message).to.contain(
                    'revert user has to pass exactly 1 ether to the constructor'
                );
            }

            expect(errorThrown).to.be.equal(true);
        });
    });

    describe('Stage 2', () => {
        it('allows to save both users addresses', async () => {
            const userOne = accounts[0];
            const userTwo = accounts[1];

            const oneEther = BigInt(1 * 10 ** 18);

            const contract = await deployHeadTailContract(web3, accounts[0], true);

            expect(await contract.methods.userOneAddress().call()).to.be.equal(userOne);

            await contract.methods.depositUserTwo(true).send({
                value: oneEther.toString(),
                from: userTwo
            });

            expect(await contract.methods.userTwoAddress().call()).to.be.equal(userTwo);
        });
    });
});

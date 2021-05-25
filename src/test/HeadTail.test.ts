import { describe } from 'mocha';
import { expect } from 'chai';
import Web3 from 'web3';
import { deployHeadTailContract, createChoiceSignature } from '../common';
import { CONFIG } from '../config';

const ONE_ETHER = BigInt(1 * 10 ** 18);

describe('HeadTail', () => {
    let web3: Web3;
    let accounts: string[];

    before(async () => {
        web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);
        accounts = await web3.eth.getAccounts();
    });

    const getBalance = async (account: string) => BigInt(await web3.eth.getBalance(account));
    const getBalanceAsString = async (account: string) => (await getBalance(account)).toString();

    describe('Stage 1', () => {
        it('allows to deposit 1 ETH', async () => {
            const account = accounts[0];

            const startingBalance = await getBalance(account);

            const contract = await deployHeadTailContract(web3, accounts[0]);
            await contract.methods.depositUserOne('0x0', ONE_ETHER.toString()).send({
                value: ONE_ETHER.toString(),
                from: accounts[0],
                gas: 5000000
            });

            expect(await getBalanceAsString(account)).to.be.equal(
                (startingBalance - ONE_ETHER).toString()
            );
        });

        it('saves address of user', async () => {
            const account = accounts[0];

            const contract = await deployHeadTailContract(web3, accounts[0]);
            await contract.methods.depositUserOne('0x0', ONE_ETHER.toString()).send({
                value: ONE_ETHER.toString(),
                from: accounts[0],
                gas: 5000000
            });

            expect(await contract.methods.userOneAddress().call()).to.be.equal(account);
        });

        it('allows depositing 777 wei', async () => {
            const account = accounts[0];

            const startingBalance = await getBalance(account);

            const contract = await deployHeadTailContract(web3, accounts[0]);
            await contract.methods.depositUserOne('0x0', '777').send({
                value: '777',
                from: accounts[0],
                gas: 5000000
            });

            expect(await getBalanceAsString(account)).to.be.equal(
                (startingBalance - BigInt(777)).toString()
            );
        });
    });

    describe('Stage 2', () => {
        it('allows to save both users addresses', async () => {
            const userOne = accounts[0];
            const userTwo = accounts[1];

            const contract = await deployHeadTailContract(web3, accounts[0]);
            await contract.methods.depositUserOne('0x0', ONE_ETHER.toString()).send({
                value: ONE_ETHER.toString(),
                from: accounts[0],
                gas: 5000000
            });

            expect(await contract.methods.userOneAddress().call()).to.be.equal(userOne);

            await contract.methods.depositUserTwo(true).send({
                value: ONE_ETHER.toString(),
                from: userTwo
            });

            expect(await contract.methods.userTwoAddress().call()).to.be.equal(userTwo);
        });
    });

    describe('Stage 5', () => {
        it('sends ether to a second user after a correct guess', async () => {
            const userOne = accounts[0];
            const userTwo = accounts[1];

            const startingUserOneBalance = await getBalance(userOne);
            const startingUserTwoBalance = await getBalance(userTwo);

            const userOneChoice = true;
            const userOneChoiceSecret = '312d35asd454asddasddd2344124444444fyguijkfdr4';

            const contract = await deployHeadTailContract(web3, userOne);
            const { signedChoiceHash } = await createChoiceSignature(
                userOne,
                userOneChoice,
                userOneChoiceSecret,
                parseInt(await contract.methods.getChainId().call(), 10),
                contract.options.address,
                web3
            );
            await contract.methods.depositUserOne(signedChoiceHash, ONE_ETHER.toString()).send({
                value: ONE_ETHER.toString(),
                from: accounts[0],
                gas: 5000000
            });

            expect(await contract.methods.userOneAddress().call()).to.be.equal(userOne);

            await contract.methods.depositUserTwo(true).send({
                value: ONE_ETHER.toString(),
                from: userTwo
            });

            await contract.methods.revealUserOneChoice(userOneChoice, userOneChoiceSecret).send({
                from: userOne
            });

            expect(await getBalanceAsString(userOne)).to.be.equal(
                (startingUserOneBalance - ONE_ETHER).toString()
            );

            expect(await getBalanceAsString(userTwo)).to.be.equal(
                (startingUserTwoBalance + ONE_ETHER).toString()
            );
        });

        // it('sends ether to a first user after an incorrect guess', async () => {

        // });
    });
});

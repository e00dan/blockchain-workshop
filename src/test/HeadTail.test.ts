import { describe } from 'mocha';
import { expect } from 'chai';
import { providers, Signer, Wallet } from 'ethers';

import { HeadTail } from '../../typechain-types';
import { deployHeadTailContract } from '../common';
import { CONFIG } from '../config';

const BET_VALUE = BigInt(1 * 10 ** 8);

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

    describe('Setup test', () => {
        beforeEach(async () => {
            contract = await deployHeadTailContract(signer, '0x');
        });

        it('deploys contract', () => {
            expect(contract.address).to.be.lengthOf(42);
        });

        it('has valid initial values', async () => {
            const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
            expect(await contract.userOneAddress()).to.be.equal(await signer.getAddress());
            expect(await contract.userTwoAddress()).to.be.equal(EMPTY_ADDRESS);
        });
    });

    describe('Stage 1', () => {
        it('allows to deposit BET_VALUE', async () => {
            const getUserOneBalance = async () => rpc.getBalance(await signer.getAddress());
            const getUserOneBalanceAsString = async () => (await getUserOneBalance()).toString();

            const startingBalance = await getUserOneBalance();

            await deployHeadTailContract(signer, '0x');

            expect(await getUserOneBalanceAsString()).to.be.equal(
                startingBalance.sub(BET_VALUE).toString()
            );
        });

        // it('saves address of user', async () => {
        //     const account = accounts[0];

        //     const contract = await deployHeadTailContract(web3, accounts[0], '0x0');

        //     expect(await contract.methods.userOneAddress().call()).to.be.equal(account);
        // });

        // it('allows depositing 777 wei', async () => {
        //     const account = accounts[0];

        //     const startingBalance = await getBalance(account);

        //     await deployHeadTailContract(web3, accounts[0], '0x0', '777');

        //     expect(await getBalanceAsString(account)).to.be.equal(
        //         (startingBalance - BigInt(777)).toString()
        //     );
        // });
    });

    // describe('Stage 2', () => {
    //     it('allows to save both users addresses', async () => {
    //         const userOne = accounts[0];
    //         const userTwo = accounts[1];

    //         const contract = await deployHeadTailContract(web3, accounts[0], '0x0');

    //         expect(await contract.methods.userOneAddress().call()).to.be.equal(userOne);

    //         await contract.methods.depositUserTwo(true).send({
    //             value: ONE_ETHER.toString(),
    //             from: userTwo
    //         });

    //         expect(await contract.methods.userTwoAddress().call()).to.be.equal(userTwo);
    //     });
    // });

    // describe('Stage 5', () => {
    //     it('sends ether to a second user after a correct guess', async () => {
    //         const userOne = accounts[0];
    //         const userTwo = accounts[1];

    //         const startingUserOneBalance = await getBalance(userOne);
    //         const startingUserTwoBalance = await getBalance(userTwo);

    //         const userOneChoice = true;
    //         const userOneChoiceSecret = '312d35asd454asddasddd2344124444444fyguijkfdr4';

    //         const { signedChoiceHash } = await createChoiceSignature(
    //             userOne,
    //             userOneChoice,
    //             userOneChoiceSecret,
    //             web3
    //         );

    //         const contract = await deployHeadTailContract(web3, userOne, signedChoiceHash);

    //         expect(await contract.methods.userOneAddress().call()).to.be.equal(userOne);

    //         await contract.methods.depositUserTwo(true).send({
    //             value: ONE_ETHER.toString(),
    //             from: userTwo
    //         });

    //         await contract.methods.revealUserOneChoice(userOneChoice, userOneChoiceSecret).send({
    //             from: userOne
    //         });

    //         expect(await getBalanceAsString(userOne)).to.be.equal(
    //             (startingUserOneBalance - ONE_ETHER).toString()
    //         );

    //         expect(await getBalanceAsString(userTwo)).to.be.equal(
    //             (startingUserTwoBalance + ONE_ETHER).toString()
    //         );
    //     });
    // });
});

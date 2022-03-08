import { describe } from 'mocha';
import { expect } from 'chai';
import { providers, Signer, Wallet } from 'ethers';

import { HeadTail } from '../../typechain-types';
import { deployHeadTailContract } from '../common';
import { CONFIG } from '../config';

const BET_VALUE = BigInt(1 * 10 ** 8);

describe('HeadTail', () => {
    let rpc: providers.JsonRpcProvider;
    let contract: HeadTail;

    let userOneSigner: Signer;
    let userTwoSigner: Signer;

    before(async () => {
        rpc = new providers.JsonRpcProvider(CONFIG.WEB3_PROVIDER_URL);

        userOneSigner = new Wallet(CONFIG.TEST_ACCOUNTS.USER_ONE_PRIVATE_KEY).connect(rpc);
        userTwoSigner = new Wallet(CONFIG.TEST_ACCOUNTS.USER_TWO_PRIVATE_KEY).connect(rpc);
    });

    describe('Setup test', () => {
        beforeEach(async () => {
            contract = await deployHeadTailContract(userOneSigner, '0x');
        });

        it('deploys contract', () => {
            expect(contract.address).to.be.lengthOf(42);
        });

        it('has valid initial values', async () => {
            const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
            expect(await contract.userOneAddress()).to.be.equal(await userOneSigner.getAddress());
            expect(await contract.userTwoAddress()).to.be.equal(EMPTY_ADDRESS);
        });
    });

    describe('Stage 1', () => {
        const getUserOneBalance = async () => rpc.getBalance(await userOneSigner.getAddress());
        const getUserOneBalanceAsString = async () => (await getUserOneBalance()).toString();

        it('allows to deposit BET_VALUE', async () => {
            const startingBalance = await getUserOneBalance();

            await deployHeadTailContract(userOneSigner, '0x');

            expect(await getUserOneBalanceAsString()).to.be.equal(
                startingBalance.sub(BET_VALUE).toString()
            );
        });

        it('saves address of user', async () => {
            contract = await deployHeadTailContract(userOneSigner, '0x');

            expect(await contract.userOneAddress()).to.be.equal(await userOneSigner.getAddress());
        });

        it('allows depositing 777 wei', async () => {
            const startingBalance = await getUserOneBalance();

            await deployHeadTailContract(userOneSigner, '0x', BigInt(777));

            expect(await getUserOneBalanceAsString()).to.be.equal(
                startingBalance.sub(777).toString()
            );
        });
    });

    describe('Stage 2', () => {
        it('allows to save both users addresses', async () => {
            contract = await deployHeadTailContract(userOneSigner, '0x');

            expect(await contract.userOneAddress()).to.be.equal(await userOneSigner.getAddress());

            const contractAsUserTwo = contract.connect(userTwoSigner);
            await contractAsUserTwo.depositUserTwo(true, {
                value: BET_VALUE
            });

            expect(await contract.userTwoAddress()).to.be.equal(await userTwoSigner.getAddress());
        });
    });

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

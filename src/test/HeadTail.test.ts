import { describe } from 'mocha';
import { expect } from 'chai';
import { providers, Signer, Wallet } from 'ethers';

import { HeadTail } from '../../typechain-types';
import { createChoiceSignature, deployHeadTailContract } from '../common';
import { CONFIG } from '../config';

const BET_VALUE = BigInt(1 * 10 ** 8);

describe('HeadTail', () => {
    let rpc: providers.JsonRpcProvider;
    let contract: HeadTail;

    let userOneSigner: Signer;
    let userOneAddress: string;
    let userTwoSigner: Signer;
    let userTwoAddress: string;

    const getBalance = async (address: string) => rpc.getBalance(address);
    const getBalanceAsString = async (address: string) => (await getBalance(address)).toString();

    before(async () => {
        rpc = new providers.JsonRpcProvider(CONFIG.WEB3_PROVIDER_URL);

        userOneSigner = new Wallet(CONFIG.TEST_ACCOUNTS.USER_ONE_PRIVATE_KEY).connect(rpc);
        userOneAddress = await userOneSigner.getAddress();
        userTwoSigner = new Wallet(CONFIG.TEST_ACCOUNTS.USER_TWO_PRIVATE_KEY).connect(rpc);
        userTwoAddress = await userTwoSigner.getAddress();
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
        it('allows to deposit BET_VALUE', async () => {
            const startingBalance = await getBalance(userOneAddress);

            await deployHeadTailContract(userOneSigner, '0x');

            expect(await getBalanceAsString(userOneAddress)).to.be.equal(
                startingBalance.sub(BET_VALUE).toString()
            );
        });

        it('saves address of user', async () => {
            contract = await deployHeadTailContract(userOneSigner, '0x');

            expect(await contract.userOneAddress()).to.be.equal(await userOneSigner.getAddress());
        });

        it('allows depositing 777 wei', async () => {
            const startingBalance = await getBalance(userOneAddress);

            await deployHeadTailContract(userOneSigner, '0x', BigInt(777));

            expect(await getBalanceAsString(userOneAddress)).to.be.equal(
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

    describe('Stage 5', () => {
        it('sends ether to a second user after a correct guess', async () => {
            const startingUserOneBalance = await getBalance(userOneAddress);
            const startingUserTwoBalance = await getBalance(userTwoAddress);

            const userOneChoice = true;
            const userOneChoiceSecret = '312d35asd454asddasddd2344124444444fyguijkfdr4';

            const { signature } = await createChoiceSignature(
                userOneSigner,
                userOneChoice,
                userOneChoiceSecret
            );

            contract = await deployHeadTailContract(userOneSigner, signature);

            expect(await contract.userOneAddress()).to.be.equal(userOneAddress);

            const contractAsUserTwo = contract.connect(userTwoSigner);
            await contractAsUserTwo.depositUserTwo(true, {
                gasPrice: 0,
                value: BET_VALUE
            });

            await contract.revealUserOneChoice(userOneChoice, userOneChoiceSecret, {
                gasPrice: 0,
                gasLimit: 10000000
            });

            expect(await getBalanceAsString(userOneAddress)).to.be.equal(
                startingUserOneBalance.sub(BET_VALUE).toString(),
                'user one lost BET_VALUE in a bet'
            );

            expect(await getBalanceAsString(userTwoAddress)).to.be.equal(
                startingUserTwoBalance.add(BET_VALUE).toString(),
                'user two won BET_VALUE in a bet'
            );
        });
    });
});

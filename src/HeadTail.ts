/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Web3 from 'web3';
import { CONFIG } from './config';
import {
    deployHeadTailContract,
    createChoiceSignature,
    domainSeparator,
    useExistingHeadTailContract
} from './common';
// import {  } from '@retric/test-provider';

const PolyjuiceHttpProviderForNode = require('@retric/test-provider/lib/cli');

const godwoken_rpc_url = 'http://localhost:8024';
const provider_config = {
    godwoken: {
        rollup_type_hash: '0x0a30665c3047d65cb3651eda93182a0d2f2087317aaba3ab35f3a970089ea9b4',
        eth_account_lock: {
            code_hash: '0x075bf74f81f492a620dc29a6193b8d66d8d351e486992141efbfce7fda5862b5',
            hash_type: 'type'
        }
    }
};
// const oneEther = BigInt(1 * 10 ** 18).toString();

const ONLY_DEPLOY_AND_STOP = false;

const BET_VALUE = BigInt(10 * 10 ** 8).toString(); // 10 CKB
const USER_ONE_PRIVATE_KEY = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
const USER_TWO_PRIVATE_KEY = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';
// N: 0x739a766a3680c77adfa38908e8899a9abe37d14f29e77af2339eb9b158844a1d7132f9e5b3a7196f9a321288e241865d0ff3cf5facc09a317af5160e0600b48301
// B: 0x7c42ff81eb095e98dfba8ff1195518e188a30cd97a7fa01e9d83b580f7710ae03f25b1702742a0d0970b6573f70c412535db01de1d2a0b724f1ac29d2af71fbd00
const userOneEthAddress = '0xD173313A51f8fc37BcF67569b463abd89d81844f';
const userTwoEthAddress = '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8';

(async () => {
    const providerUserOne = new PolyjuiceHttpProviderForNode(
        godwoken_rpc_url,
        provider_config,
        [],
        USER_ONE_PRIVATE_KEY
    );
    const web3UserOne = new Web3(providerUserOne);

    const providerUserTwo = new PolyjuiceHttpProviderForNode(
        godwoken_rpc_url,
        provider_config,
        [],
        USER_TWO_PRIVATE_KEY
    );
    const web3UserTwo = new Web3(providerUserTwo);

    // const USER_ONE_ACCOUNT = web3.eth.accounts.wallet.add(USER_ONE_PRIVATE_KEY);
    // const USER_TWO_ACCOUNT = web3.eth.accounts.wallet.add(USER_TWO_PRIVATE_KEY);

    // const userOneEthAddress = USER_ONE_ACCOUNT.address;
    // const userTwoEthAddress = '0x'; // USER_TWO_ACCOUNT.address;

    const choice = true;
    const secret = 'THIS_IS_SECRET';

    console.log({
        userOneEthAddress,
        choice,
        secret,
        betRequiredDeposit: formatBalance(BET_VALUE)
    });

    const DEFAULT_CALL_OPTIONS = {
        gasPrice: '0',
        from: userOneEthAddress
    };

    console.log('Deploying contract...');

    const headTailUserOne = await deployHeadTailContract(web3UserOne, userOneEthAddress);

    console.log(`Deployed contract: ${headTailUserOne.options.address}`);

    const headTailUserTwo = await useExistingHeadTailContract(
        web3UserTwo,
        headTailUserOne.options.address
    );

    const CHAIN_ID = parseInt(
        await headTailUserOne.methods.getChainId().call(DEFAULT_CALL_OPTIONS),
        10
    );

    console.log(`chain id: ${CHAIN_ID}`);

    console.log('ERC712 (typed signing) info', {
        domainSeparatorFromContract: await headTailUserOne.methods
            .domainSeparator()
            .call(DEFAULT_CALL_OPTIONS),
        domainSeparatorFromJS: await domainSeparator(
            'HeadTail',
            '1',
            CHAIN_ID,
            headTailUserOne.options.address
        )
    });

    if (ONLY_DEPLOY_AND_STOP) {
        return;
    }

    const { signedChoiceHash } = await createChoiceSignature(
        userOneEthAddress,
        choice,
        secret,
        CHAIN_ID,
        headTailUserOne.options.address,
        web3UserOne,
        USER_ONE_PRIVATE_KEY
    );

    console.log(`user balances before bet:
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, web3UserOne)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, web3UserOne)}
    `);

    await headTailUserOne.methods.depositUserOne(signedChoiceHash, BET_VALUE).send({
        value: BET_VALUE,
        from: userOneEthAddress,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log(
        `deposit user one worked (choice=true), user one Polyjuice address: ${await headTailUserOne.methods
            .userOneAddress()
            .call(DEFAULT_CALL_OPTIONS)}`
    );

    await headTailUserTwo.methods.depositUserTwo(false).send({
        value: BET_VALUE,
        from: userTwoEthAddress,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log(
        `deposit user two worked (choice=false), user two Polyjuice address: ${await headTailUserOne.methods
            .userTwoAddress()
            .call(DEFAULT_CALL_OPTIONS)}`
    );

    const addressRecoveredInJS = await headTailUserOne.methods
        .verify([choice, secret], signedChoiceHash)
        .call(DEFAULT_CALL_OPTIONS);

    console.log({
        signedChoiceHash,
        addressRecoveredInJS
    });

    console.log('Settling the bet...');

    await headTailUserOne.methods.revealUserOneChoice(true, secret).send({
        from: userOneEthAddress,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log('Bet settled successfully.');

    console.log(`user balances after bet:
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, web3UserOne)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, web3UserOne)}
    `);
})();

function formatBalance(balance: string) {
    const formatted = (BigInt(balance) / BigInt(Math.pow(10, 8))).toString();

    return `${formatted} CKB`;
}

async function getBalanceAndDisplayFormatted(ethAddress: string, web3: Web3) {
    const rawBalance = await web3.eth.getBalance(ethAddress);

    return formatBalance(rawBalance);
}

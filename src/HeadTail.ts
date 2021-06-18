/* eslint-disable @typescript-eslint/no-use-before-define */
import Web3 from 'web3';
import { CONFIG } from './config';
import { deployHeadTailContract, createChoiceSignature, domainSeparator } from './common';

// const oneEther = BigInt(1 * 10 ** 18).toString();

const ONLY_DEPLOY_AND_STOP = false;

const BET_VALUE = BigInt(10 * 10 ** 8).toString(); // 10 CKB

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const USER_ONE_PRIVATE_KEY =
        '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
    const USER_TWO_PRIVATE_KEY =
        '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';

    const USER_ONE_ACCOUNT = web3.eth.accounts.wallet.add(USER_ONE_PRIVATE_KEY);
    const USER_TWO_ACCOUNT = web3.eth.accounts.wallet.add(USER_TWO_PRIVATE_KEY);

    const userOneEthAddress = USER_ONE_ACCOUNT.address;
    const userTwoEthAddress = USER_TWO_ACCOUNT.address;

    const choice = true;
    const secret = 'THIS_IS_SECRET';

    console.log({
        userOneEthAddress,
        choice,
        secret,
        betRequiredDeposit: formatBalance(BET_VALUE)
    });

    const DEFAULT_CALL_OPTIONS = {
        gasPrice: '0'
    };

    const headTail = await deployHeadTailContract(web3, userOneEthAddress);

    console.log(`deployed contract: ${headTail.options.address}`);

    const CHAIN_ID = parseInt(await headTail.methods.getChainId().call(DEFAULT_CALL_OPTIONS), 10);

    console.log(`chain id: ${CHAIN_ID}`);

    console.log('ERC712 (typed signing) info', {
        domainSeparatorFromContract: await headTail.methods
            .domainSeparator()
            .call(DEFAULT_CALL_OPTIONS),
        domainSeparatorFromJS: await domainSeparator(
            'HeadTail',
            '1',
            CHAIN_ID,
            headTail.options.address
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
        headTail.options.address,
        web3,
        USER_ONE_PRIVATE_KEY
    );

    console.log(`user balances before bet:
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, web3)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, web3)}
    `);

    await headTail.methods.depositUserOne(signedChoiceHash, BET_VALUE).send({
        value: BET_VALUE,
        from: userOneEthAddress,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log(
        `deposit user one worked (choice=true), user one Polyjuice address: ${await headTail.methods
            .userOneAddress()
            .call(DEFAULT_CALL_OPTIONS)}`
    );

    await headTail.methods.depositUserTwo(false).send({
        value: BET_VALUE,
        from: userTwoEthAddress,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log(
        `deposit user two worked (choice=false), user two Polyjuice address: ${await headTail.methods
            .userTwoAddress()
            .call(DEFAULT_CALL_OPTIONS)}`
    );

    const addressRecoveredInJS = await headTail.methods
        .verify([choice, secret], signedChoiceHash)
        .call(DEFAULT_CALL_OPTIONS);

    console.log({
        signedChoiceHash,
        addressRecoveredInJS
    });

    await headTail.methods.revealUserOneChoice(true, secret).send({
        from: userOneEthAddress,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log('bet settled successfully');

    console.log(`user balances after bet:
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, web3)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, web3)}
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

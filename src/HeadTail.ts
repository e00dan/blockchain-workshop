/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-use-before-define */
import Web3 from 'web3';
import { PolyjuiceAccounts, PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import {
    deployHeadTailContract,
    createChoiceSignature,
    domainSeparator,
    useExistingHeadTailContract
} from './common';

const providerConfig = {
    web3Url: 'https://godwoken-testnet-web3-rpc.ckbapp.dev'
};

const ONLY_DEPLOY_AND_STOP = false;

const BET_VALUE = BigInt(10).toString(); // 10 CKB
const USER_ONE_PRIVATE_KEY = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
const USER_TWO_PRIVATE_KEY = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';

async function runDemo() {
    // workaround to keep program alive
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    setInterval(() => {}, 1 << 30);

    const provider = new PolyjuiceHttpProvider(providerConfig.web3Url, providerConfig);

    const web3 = new Web3(provider);

    web3.eth.accounts = new PolyjuiceAccounts(providerConfig);
    const USER_ONE_ACCOUNT = web3.eth.accounts.wallet.add(USER_ONE_PRIVATE_KEY);
    const USER_TWO_ACCOUNT = web3.eth.accounts.wallet.add(USER_TWO_PRIVATE_KEY);
    (web3.eth.Contract as any).setProvider(provider, web3.eth.accounts);

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
        gasPrice: '0',
        from: userOneEthAddress
    };

    console.log('Deploying contract...');

    const headTailUserOne = await deployHeadTailContract(web3, userOneEthAddress);

    console.log(`Deployed contract: ${headTailUserOne.options.address}`);

    const headTailUserTwo = await useExistingHeadTailContract(
        web3,
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
        web3,
        USER_ONE_PRIVATE_KEY
    );

    console.log(`user balances before bet:
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, web3)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, web3)}
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
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, web3)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, web3)}
    `);

    process.exit();
}

function formatBalance(balance: string) {
    const formatted = (BigInt(balance) / BigInt(Math.pow(10, 8))).toString();

    return `${formatted} CKB`;
}

async function getBalanceAndDisplayFormatted(ethAddress: string, web3: Web3) {
    const rawBalance = await web3.eth.getBalance(ethAddress);

    return formatBalance(rawBalance);
}

(async () => {
    await runDemo();
})();

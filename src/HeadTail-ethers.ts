/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ContractFactory, ethers } from 'ethers';
import { PolyjuiceJsonRpcProvider } from '@retric/test-provider/lib/hardhat/providers';
import PolyjuiceWallet from '@retric/test-provider/lib/hardhat/wallet-signer';
import { domainSeparator, createChoiceSignaturePK } from './common';
import * as HeadTailJSON from '../build/contracts/HeadTail.json';

const godwokenRpcUrl = 'http://localhost:8024';
const providerConfig = {
    godwoken: {
        rollup_type_hash: '0x0a30665c3047d65cb3651eda93182a0d2f2087317aaba3ab35f3a970089ea9b4',
        eth_account_lock: {
            code_hash: '0x075bf74f81f492a620dc29a6193b8d66d8d351e486992141efbfce7fda5862b5',
            hash_type: 'type' as any
        }
    }
};

const ONLY_DEPLOY_AND_STOP = false;

const BET_VALUE = BigInt(10 * 10 ** 8).toString(); // 10 CKB
const USER_ONE_PRIVATE_KEY = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
const USER_TWO_PRIVATE_KEY = '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';

const userOneEthAddress = '0xD173313A51f8fc37BcF67569b463abd89d81844f';
const userTwoEthAddress = '0xd46aC0Bc23dB5e8AfDAAB9Ad35E9A3bA05E092E8';

(async () => {
    const provider = new PolyjuiceJsonRpcProvider(godwokenRpcUrl);
    const walletUserOne = new PolyjuiceWallet(
        USER_ONE_PRIVATE_KEY,
        {
            godwokerOption: providerConfig,
            web3RpcUrl: godwokenRpcUrl
        },
        provider
    );
    const walletUserTwo = new PolyjuiceWallet(
        USER_TWO_PRIVATE_KEY,
        {
            godwokerOption: providerConfig,
            web3RpcUrl: godwokenRpcUrl
        },
        provider
    );

    const choice = true;
    const secret = 'THIS_IS_SECRET';

    console.log({
        userOneEthAddress,
        choice,
        secret,
        betRequiredDeposit: formatBalance(BET_VALUE)
    });

    const DEFAULT_SEND_OPTIONS = {
        gasPrice: 0,
        gasLimit: 10000000
    };

    console.log('Deploying contract...');

    const factory = new ContractFactory(HeadTailJSON.abi, HeadTailJSON.bytecode, walletUserOne);
    // const contract = await factory.deploy();

    const tx = factory.getDeployTransaction();
    tx.gasPrice = 0;
    tx.gasLimit = 1_000_000;
    const txResponse = await walletUserOne.sendTransaction(tx);
    const receipt = await txResponse.wait();

    const headTailUserOne = new ethers.Contract(
        receipt.contractAddress,
        HeadTailJSON.abi,
        provider
    ).connect(walletUserOne);
    const headTailUserTwo = new ethers.Contract(
        receipt.contractAddress,
        HeadTailJSON.abi,
        provider
    ).connect(walletUserTwo);

    console.log(`Deployed contract: ${headTailUserOne.address}`);

    const CHAIN_ID = parseInt(await headTailUserOne.getChainId(), 10);

    console.log(`chain id: ${CHAIN_ID}`);

    console.log('ERC712 (typed signing) info', {
        domainSeparatorFromContract: await headTailUserOne.domainSeparator(),
        domainSeparatorFromJS: await domainSeparator(
            'HeadTail',
            '1',
            CHAIN_ID,
            headTailUserOne.address
        )
    });

    if (ONLY_DEPLOY_AND_STOP) {
        return;
    }

    const { signedChoiceHash } = await createChoiceSignaturePK(
        choice,
        secret,
        CHAIN_ID,
        headTailUserOne.address,
        USER_ONE_PRIVATE_KEY
    );

    console.log(`user balances before bet:
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, provider)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, provider)}
    `);

    await (
        await headTailUserOne.depositUserOne(signedChoiceHash, BET_VALUE, {
            ...DEFAULT_SEND_OPTIONS,
            value: BET_VALUE
        })
    ).wait();

    console.log(
        `deposit user one worked (choice=true), user one Polyjuice address: ${await headTailUserOne.userOneAddress()}`
    );

    await (
        await headTailUserTwo.depositUserTwo(false, {
            ...DEFAULT_SEND_OPTIONS,
            value: BET_VALUE
        })
    ).wait();

    console.log(
        `deposit user two worked (choice=false), user two Polyjuice address: ${await headTailUserOne.userTwoAddress()}`
    );

    const addressRecoveredInJS = await headTailUserOne.verify([choice, secret], signedChoiceHash);

    console.log({
        signedChoiceHash,
        addressRecoveredInJS
    });

    console.log('Settling the bet...');

    await headTailUserOne.revealUserOneChoice(true, secret, DEFAULT_SEND_OPTIONS);

    console.log('Bet settled successfully.');

    console.log(`user balances after bet:
        1 = ${await getBalanceAndDisplayFormatted(userOneEthAddress, provider)}
        2 = ${await getBalanceAndDisplayFormatted(userTwoEthAddress, provider)}
    `);
})();

function formatBalance(balance: string) {
    const formatted = (BigInt(balance) / BigInt(Math.pow(10, 8))).toString();

    return `${formatted} CKB`;
}

async function getBalanceAndDisplayFormatted(
    ethAddress: string,
    provider: PolyjuiceJsonRpcProvider
) {
    const rawBalance = (await provider.getBalance(ethAddress)).toString();

    return formatBalance(rawBalance);
}

import Web3 from 'web3';
import { bufferToHex } from 'ethereumjs-util';
import { CONFIG } from './config';
import { deployHeadTailContract, createChoiceSignature, domainSeparator } from './common';

// const oneEther = BigInt(1 * 10 ** 18).toString();

const BET_VALUE = BigInt(10 * 10 ** 8).toString(); // 10 CKB

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const USER_ONE_PRIVATE_KEY =
        '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
    const USER_TWO_PRIVATE_KEY =
        '0xd9bc30dc17023fbb68fe3002e0ff9107b241544fd6d60863081c55e383f1b5a3';

    const USER_ONE_ACCOUNT = web3.eth.accounts.wallet.add(USER_ONE_PRIVATE_KEY);
    const USER_TWO_ACCOUNT = web3.eth.accounts.wallet.add(USER_TWO_PRIVATE_KEY);

    const userOne = USER_ONE_ACCOUNT.address;
    const userTwo = USER_TWO_ACCOUNT.address;

    const choice = true;
    const secret = 'THIS_IS_SECRET';

    console.log({
        userOne,
        choice,
        secret
    });

    const DEFAULT_CALL_OPTIONS = {
        gasPrice: '0'
    };

    const headTail = await deployHeadTailContract(web3, userOne);

    console.log(`deployed contract: ${headTail.options.address}`);

    const CHAIN_ID = parseInt(await headTail.methods.getChainId().call(DEFAULT_CALL_OPTIONS), 10);

    console.log(`chain id: ${CHAIN_ID}`);

    console.log({
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

    const { signedChoiceHash } = await createChoiceSignature(
        userOne,
        choice,
        secret,
        CHAIN_ID,
        headTail.options.address,
        web3,
        USER_ONE_PRIVATE_KEY
    );

    await headTail.methods.depositUserOne(signedChoiceHash, BET_VALUE).send({
        value: BET_VALUE,
        from: userOne,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log('deposit user one worked');

    await headTail.methods.depositUserTwo(false).send({
        value: BET_VALUE,
        from: userTwo,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log('deposit user two worked');

    const addressRecoveredInJS = await headTail.methods
        .verify([choice, secret], signedChoiceHash)
        .call(DEFAULT_CALL_OPTIONS);

    console.log({
        signedChoiceHash,
        addressRecoveredInJS
    });

    await headTail.methods.revealUserOneChoice(true, secret).send({
        from: userOne,
        gas: 5000000,
        gasPrice: '0'
    });

    console.log('bet settled successfully');
})();

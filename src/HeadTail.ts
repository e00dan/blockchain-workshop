import Web3 from 'web3';
import { bufferToHex } from 'ethereumjs-util';
import { CONFIG } from './config';
import { deployHeadTailContract, createChoiceSignature, domainSeparator } from './common';

const oneEther = BigInt(1 * 10 ** 18).toString();

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const FALLBACK_ACCOUNT = web3.eth.accounts.wallet.add(
        '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5'
    );

    const accounts = await web3.eth.getAccounts();

    const userOne = accounts[0] || FALLBACK_ACCOUNT.address;
    const userTwo = accounts[1];

    const choice = true;
    const secret = '312d35asd454asddasddd2344124444444fyguijkfdr4';

    console.log({
        userOne,
        choice,
        secret
    });

    const headTail = await deployHeadTailContract(web3, userOne);

    console.log(`deployed contract: ${headTail.options.address}`);

    const CHAIN_ID = parseInt(await headTail.methods.getChainId().call(), 10);

    console.log(`chain id: ${CHAIN_ID}`);

    console.log({
        domainSeparatorFromContract: await headTail.methods.domainSeparator().call(),
        domainSeparatorFromJS: await domainSeparator(
            'HeadTail',
            '1',
            CHAIN_ID,
            headTail.options.address
        )
    });

    const { signedChoiceHash, choiceHash } = await createChoiceSignature(
        userOne,
        choice,
        secret,
        CHAIN_ID,
        headTail.options.address,
        web3
    );

    await headTail.methods.depositUserOne(signedChoiceHash, oneEther).send({
        value: oneEther,
        from: userOne,
        gas: 5000000
    });

    console.log('deposit user one worked');

    await headTail.methods.depositUserTwo(false).send({
        value: oneEther,
        from: userTwo
    });

    console.log('deposit user two worked');

    const addressRecoveredInJS = await headTail.methods
        .verify([choice, secret], signedChoiceHash)
        .call();

    await headTail.methods.revealUserOneChoice(true, secret).send({
        from: userOne
    });

    console.log({
        choiceHash,
        signedChoiceHash,
        addressRecoveredInJS
    });
})();

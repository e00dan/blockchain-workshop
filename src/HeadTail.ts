import { providers, utils, Wallet } from 'ethers';

import { CONFIG } from './config';
import { deployHeadTailContract, createChoiceSignature } from './common';

const betValue = BigInt(1 * 10 ** 8);

(async () => {
    const rpc = new providers.JsonRpcProvider(CONFIG.WEB3_PROVIDER_URL);

    const userOneWallet = new Wallet(CONFIG.TEST_ACCOUNTS.USER_ONE_PRIVATE_KEY);
    const userOneSigner = userOneWallet.connect(rpc);
    const userOneAddress = await userOneSigner.getAddress();

    const userTwoWallet = new Wallet(CONFIG.TEST_ACCOUNTS.USER_TWO_PRIVATE_KEY);
    const userTwoSigner = userTwoWallet.connect(rpc);
    const userTwoAddress = await userTwoSigner.getAddress();

    const choice = true;
    const secret = '312d35asd454asddasddd2344124444444fyguijkfdr4';

    console.log({
        userOneAddress,
        userTwoAddress,
        choice,
        secret
    });

    const { choiceHash, signature } = await createChoiceSignature(userOneSigner, choice, secret);

    console.log({
        choiceHash,
        signature
    });

    const headTailUserOne = await deployHeadTailContract(userOneSigner, signature);

    const headTailUserTwo = headTailUserOne.connect(userTwoSigner);
    await headTailUserTwo.depositUserTwo(false, {
        value: betValue
    });

    console.log({
        userTwoAddressFromSC: await headTailUserOne.userTwoAddress()
    });

    const messageHashBytes = utils.arrayify(choiceHash);
    const addressRecoveredInJSEthers = utils.verifyMessage(messageHashBytes, signature);

    await headTailUserOne.revealUserOneChoice(true, secret);
    // const revealReceipt = await revealTx.wait();

    const addressFromSC = await headTailUserOne.verify(choiceHash, signature);

    console.log({
        // choiceHash,
        // signedChoiceHash,
        addressFromSC,
        addressRecoveredInJSEthers
        // revealReceipt
    });
})();

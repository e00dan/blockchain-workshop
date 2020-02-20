import Web3 from 'web3';
import { bufferToHex } from 'ethereumjs-util';
import { CONFIG } from './config';
import { deployHeadTailContract, createChoiceSignature } from './common';

const oneEther = BigInt(1 * 10 ** 18).toString();

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const accounts = await web3.eth.getAccounts();

    const userOne = accounts[0];
    const userTwo = accounts[1];

    const choice = true;
    const secret = '312d35asd454asddasddd2344124444444fyguijkfdr4';

    console.log({
        userOne,
        choice,
        secret
    });

    const { signedChoiceHash, choiceHash, v, r, s } = await createChoiceSignature(
        userOne,
        choice,
        secret,
        web3
    );

    console.log({
        signedChoiceHash,
        choiceHash,
        v,
        r,
        s
    });

    const headTail = await deployHeadTailContract(web3, userOne, signedChoiceHash);

    await headTail.methods.depositUserTwo(false).send({
        value: oneEther,
        from: userTwo
    });

    const addressRecoveredInJS = web3.eth.accounts.recover(
        choiceHash,
        `0x${v.toString(16)}`,
        bufferToHex(r),
        bufferToHex(s)
    );

    await headTail.methods.revealUserOneChoice(true, secret).send();

    console.log({
        choiceHash,
        signedChoiceHash,
        addressRecoveredInJS
    });
})();

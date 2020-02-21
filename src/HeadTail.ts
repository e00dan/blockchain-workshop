import Web3 from 'web3';
import { CONFIG } from './config';
import { deployHeadTailContract } from './common';

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const accounts = await web3.eth.getAccounts();

    const userOne = accounts[0];
    const userTwo = accounts[1];

    const headTail = await deployHeadTailContract(web3, userOne);

    const oneEther = 1 * 10 ** 18;

    await headTail.methods.depositUserOne(true).send({
        value: oneEther,
        from: userOne
    });

    await headTail.methods.depositUserTwo(true).send({
        value: oneEther,
        from: userTwo
    });

    console.log({
        userOne: await headTail.methods.userOneAddress().call(),
        userTwo: await headTail.methods.userTwoAddress().call(),
        userOneChoice: await headTail.methods.userOneChoice().call(),
        userTwoChoice: await headTail.methods.userTwoChoice().call()
    });
})();

import Web3 from 'web3';
import { CONFIG } from './config';
import { deployHeadTailContract } from './common';

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const accounts = await web3.eth.getAccounts();
    const userOne = accounts[0];

    const headTail = await deployHeadTailContract(web3, userOne);

    const oneEther = 1 * 10 ** 18;

    await headTail.methods.deposit().send({
        value: oneEther,
        from: userOne
    });

    console.log(await headTail.methods.depositingUserAddress().call());
})();

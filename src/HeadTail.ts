import Web3 from 'web3';
import { CONFIG } from './config';
import { deployHeadTailContract } from './common';

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const accounts = await web3.eth.getAccounts();
    const userOne = accounts[0];

    const headTail = await deployHeadTailContract(web3, userOne);

    await headTail.methods.setCounter(2).send({
        from: userOne
    });

    console.log(await headTail.methods.counter().call());
    console.log(await headTail.methods.counterMultiplied(2).call()); // 4
    console.log(await headTail.methods.counterMultipliedSquare(2).call()); // 8
})();

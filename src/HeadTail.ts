import { setupLoader } from '@openzeppelin/contract-loader';
import Web3 from 'web3';
import { HeadTail } from './types/HeadTail';
import { CONFIG } from './config';

export async function deployHeadTailContract(web3: Web3, defaultSender: string): Promise<HeadTail> {
    const loader = setupLoader({
        provider: web3,
        defaultSender,
        defaultGasPrice: 0
    }).web3;

    const HeadTailContract: HeadTail = loader.fromArtifact('HeadTail');

    return HeadTailContract.deploy({
        data: '',
        arguments: []
    }).send({
        from: defaultSender
    });
}

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const accounts = await web3.eth.getAccounts();

    const userOne = accounts[0];
    const userTwo = accounts[1];

    const headTail = await deployHeadTailContract(web3, userOne);

    const oneEther = 1 * 10 ** 18;

    await headTail.methods.depositUserOne().send({
        value: oneEther,
        from: userOne
    });

    await headTail.methods.depositUserTwo().send({
        value: oneEther,
        from: userTwo
    });

    console.log({
        userOne: await headTail.methods.userOneAddress().call(),
        userTwo: await headTail.methods.userTwoAddress().call()
    });
})();

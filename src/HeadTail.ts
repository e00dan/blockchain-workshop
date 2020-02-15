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
        from: defaultSender,
        gas: 6000000
    });
}

(async () => {
    const web3 = new Web3(CONFIG.WEB3_PROVIDER_URL);

    const accounts = await web3.eth.getAccounts();

    const headTail = await deployHeadTailContract(web3, accounts[0]);

    const oneEther = 1 * 10 ** 18;

    await headTail.methods.deposit().send({
        value: oneEther
    });

    console.log(await headTail.methods.depositingUserAddress().call());
})();

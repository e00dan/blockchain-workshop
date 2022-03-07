import { providers, Wallet } from 'ethers';

import { CONFIG } from './config';
import { deployHeadTailContract } from './common';

(async () => {
    const rpc = new providers.JsonRpcProvider(CONFIG.WEB3_PROVIDER_URL);
    const wallet = new Wallet(CONFIG.TEST_ACCOUNTS.USER_ONE_PRIVATE_KEY);
    const signer = wallet.connect(rpc);
    const userOne = signer.getAddress();

    const headTail = await deployHeadTailContract(signer);

    await headTail.setCounter(2, {
        from: userOne
    });

    console.log(`counter(): ${await (await headTail.counter()).toBigInt()}`);
    console.log(`counterMultiplied(): ${await (await headTail.counterMultiplied(2)).toBigInt()}`); // 4
    console.log(
        `counterMultipliedBySquareOf(): ${await (
            await headTail.counterMultipliedBySquareOf(3)
        ).toBigInt()}`
    ); // 8
})();

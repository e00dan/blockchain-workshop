import { providers } from 'ethers';

import { CONFIG } from './config';
import { deployHeadTailContract } from './common';

(async () => {
    const rpc = new providers.JsonRpcProvider(CONFIG.WEB3_PROVIDER_URL);
    const accounts = await rpc.listAccounts();
    const userOne = accounts[0];

    const headTail = await deployHeadTailContract(rpc, userOne);

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

import PWCore, { EthProvider, IndexerCollector, RawProvider } from '@lay2/pw-core';
import { PW_DEV_CHAIN_ID, PW_DEV_CONFIG } from '../../configs/pw-dev-config';
import { pwCollectorUrl, ckbUrl } from '../urls';

export async function initPWCore(privateKey?: string) {
    return;

    const provider = privateKey ? new RawProvider(privateKey) : new EthProvider();
    const collector = new IndexerCollector(pwCollectorUrl);
    
    const pwcore = await new PWCore(ckbUrl).init(
        provider,
        collector,
        PW_DEV_CHAIN_ID,
        PW_DEV_CONFIG
    );

    const balance = await collector.getBalance(provider.address);

    console.log(`CKB address: ${provider.address.toCKBAddress()}`, {
        lockScript: provider.address.toLockScript().serializeJson()
    });

    // console.log(`Balance of: ${provider.address.addressString} is: "${balance}"`);

    return { pwcore, balance };
}

import Config from '../configs/config.json';

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}

const godwokenUrls: string[] = Config.godwoken.rpc;
const godwokenUrlIndex = getRandomInt(godwokenUrls.length);
export const godwokenUrl = godwokenUrls[godwokenUrlIndex];

const ckbUrls: string[] = Config.ckb.rpc;
const ckbUrlIndex = getRandomInt(ckbUrls.length);
export const ckbUrl = ckbUrls[ckbUrlIndex];

export const pwCollectorUrl = Config.pw.pw_collector_url;

console.log('ckbUrl', { ckbUrl, pwCollectorUrl });

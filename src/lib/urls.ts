import Config from '../configs/config.json';

function getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
}

const godwokenUrls: string[] = Config.godwoken.rpc;
const godwokenUrlIndex = getRandomInt(godwokenUrls.length);
export const godwokenUrl = godwokenUrls[godwokenUrlIndex];
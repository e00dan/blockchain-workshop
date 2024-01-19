import { HttpTransport, PublicClient, createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';

export const CONFIG = {
    WEB3_PROVIDER_URL: 'http://localhost:8545'
};

export const publicClient: PublicClient<HttpTransport, typeof hardhat> = createPublicClient({
    chain: hardhat,
    transport: http()
});

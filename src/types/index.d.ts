/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

type EthereumProvider = { request(...args: any): Promise<any> };

declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}

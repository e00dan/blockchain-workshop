import React, { useEffect, useState } from 'react';
import { CustomTransport, WalletClient, createWalletClient, custom } from 'viem';
import { hardhat } from 'viem/chains';

import './app.css';
import { deployHeadTailContract } from '../common';

async function initializeBrowserWalletClient() {
    // Modern dapp browsers...
    if (window.ethereum) {
        try {
            const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

            return createWalletClient({
                account,
                chain: hardhat,
                transport: custom(window.ethereum)
            });
        } catch (error) {
            // User denied account access...
        }
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [walletClient, setWalletClient] = useState<WalletClient<
        CustomTransport,
        typeof hardhat
    > | null>(null);

    const [contract, setContract] = useState<Awaited<ReturnType<typeof deployHeadTailContract>>>();

    async function deployContract() {
        if (!walletClient) {
            return;
        }

        setContract(await deployHeadTailContract(walletClient));
    }

    useEffect(() => {
        if (walletClient) {
            return;
        }

        (async () => {
            setWalletClient(await initializeBrowserWalletClient());
        })();
    });

    return (
        <div>
            Deployed contract address: <b>{contract?.address}</b>
            <br />
            <br />
            <button onClick={deployContract}>Deploy contract</button>
        </div>
    );
}

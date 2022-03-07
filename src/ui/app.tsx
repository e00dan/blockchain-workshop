import React, { useEffect, useState } from 'react';
import { providers } from 'ethers';
import { deployHeadTailContract } from '../common';
import { HeadTail } from '../../typechain-types';
import './app.css';

async function createProvider() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        try {
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            const provider = new providers.Web3Provider((window as any).ethereum);

            // MetaMask requires requesting permission to connect users accounts
            await provider.send('eth_requestAccounts', []);

            return provider;
        } catch (error) {
            // User denied account access...
        }
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [provider, setProvider] = useState<providers.Web3Provider>(null);
    const [contract, setContract] = useState<HeadTail>();

    async function deployContract() {
        setContract(await deployHeadTailContract(provider.getSigner(), '0x'));
    }

    useEffect(() => {
        if (provider) {
            return;
        }

        (async () => {
            setProvider(await createProvider());
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

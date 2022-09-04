/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import './app.css';
import 'react-toastify/dist/ReactToastify.css';

import { ethers, providers } from 'ethers';
import { Address, AddressType, LockType } from '@lay2/pw-core';
import { PortalWalletWrapper } from './pwcore';
import { getNFTsAtAddress } from './nft/api';
import { EnrichedMNFT, TransactionBuilderExpectedMNFTData } from './nft/nft';
import { CONFIG } from './nft/config';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        let provider: providers.Web3Provider | undefined;

        try {
            // A Web3Provider wraps a standard Web3 provider, which is
            // what MetaMask injects as window.ethereum into each page
            provider = new ethers.providers.Web3Provider((window as any).ethereum);

            // MetaMask requires requesting permission to connect users accounts
            await provider.send('eth_requestAccounts', []);
        } catch (error) {
            // User denied account access...
        }

        return provider;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<providers.Web3Provider>(null);
    const [accounts, setAccounts] = useState<string[]>();
    const [MNFTs, setMNFTs] = useState<EnrichedMNFT[]>();
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [receiverAddress, setReceiverAddress] = useState<string>();
    const [layerOneTransactionHash, setLayerOneTransactionHash] = useState<string>();
    const [portalWalletWrapper, setPortalWalletWrapper] = useState<PortalWalletWrapper>();

    const account = accounts?.[0];

    async function fetchMNFTs() {
        setSelectedItems([]);
        try {
            const address = new Address(account, AddressType.eth, undefined, LockType.pw);
            const _MNFTs = await getNFTsAtAddress(address);
            const _processedMNFTs: EnrichedMNFT[] = [];

            for (const token of _MNFTs) {
                await token.getConnectedClass();
                await token.getConnectedIssuer();

                const classData = token.getClassData();
                const issuerData = token.getIssuerData();

                _processedMNFTs.push({
                    tokenId: token.id,
                    name: `${classData.name} #${token.getTypeScriptArguments().tokenId}`,
                    renderer: classData.renderer,
                    issuerName: issuerData.info.name,
                    token
                });
            }

            setMNFTs(_processedMNFTs);

            toast('mNFTs on Layer 1 address fetched', { type: 'success' });
        } catch (error) {
            console.error(error);
            toast('Undefined error.');
        }
    }

    async function bridgeSelectedItems() {
        const _processedMNFTs: TransactionBuilderExpectedMNFTData[] = [];

        try {
            for (const { token: nft } of MNFTs) {
                const classTypeArgs = nft.nftClassCell?.output.type?.args;
                const nftTypeArgs = nft.typeScriptArguments;

                if (!classTypeArgs) {
                    throw new Error('classTypeArgs undefined');
                }

                const unipassExpectedNft: TransactionBuilderExpectedMNFTData = {
                    classTypeArgs,
                    nftTypeArgs,
                    tokenId: nft.getTypeScriptArguments().tokenId.toString(),
                    outPoint: {
                        txHash: nft.outpoint.tx_hash,
                        index: nft.outpoint.index
                    }
                };

                _processedMNFTs.push(unipassExpectedNft);
            }

            const transactionId = await portalWalletWrapper.bridgeMNFTS(
                CONFIG.LAYER_ONE_BRIDGE_CKB_ADDRESS,
                _processedMNFTs,
                receiverAddress
            );

            setLayerOneTransactionHash(transactionId);
            toast.success(`Successfully sent Layer 1 transaction.`);
        } catch (error) {
            console.error(error);
            toast('Undefined error.');
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            const wrapper = new PortalWalletWrapper();
            await wrapper.init({});

            setPortalWalletWrapper(wrapper);
        })();
    });

    return (
        <div>
            Your ETH address: <b>{account}</b>
            <br />
            <br />
            <hr />
            <button onClick={() => fetchMNFTs()} disabled={!account}>
                Fetch mNFTs on your PortalWallet account
            </button>
            <br />
            <br />
            CKB required to bridge mNFTs: {selectedItems.length * 111}
            <br />
            <br />
            <input
                placeholder="Receiver Ethereum address on Godwoken"
                onChange={e => setReceiverAddress(e.target.value)}
                style={{ minWidth: '400px' }}
            />
            <br />
            <br />
            <button
                onClick={() => bridgeSelectedItems()}
                disabled={!account || selectedItems.length === 0}
            >
                Bridge selected mNFTs
            </button>
            <br />
            <br />
            {layerOneTransactionHash && (
                <span>
                    Layer 1 transaction hash: <b>{layerOneTransactionHash}</b>
                </span>
            )}
            <hr />
            {MNFTs && (
                <table>
                    <thead>
                        <tr>
                            <td>Selected</td>
                            <td>Image</td>
                            <td>ID</td>
                        </tr>
                    </thead>
                    <tbody>
                        {MNFTs.map(mnft => (
                            <tr key={mnft.tokenId}>
                                <td>
                                    <input
                                        type="checkbox"
                                        onChange={e => {
                                            if (e.target.checked) {
                                                setSelectedItems([
                                                    ...new Set(selectedItems.concat(mnft.tokenId))
                                                ]);
                                            } else {
                                                setSelectedItems(
                                                    selectedItems.filter(i => i !== mnft.tokenId)
                                                );
                                            }
                                        }}
                                    />
                                </td>
                                <td>
                                    <img
                                        src={mnft.renderer}
                                        style={{ width: '40px', height: '40px' }}
                                    />
                                </td>
                                <td>{mnft.tokenId}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <br />
            <br />
            <hr />
            <ToastContainer />
        </div>
    );
}

import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

const PRIVATE_KEY = '0xd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';

export default {
    solidity: '0.8.9',
    typechain: {
        target: 'ethers-v5'
    },
    networks: {
        hardhat: {
            accounts: {
                mnemonic: 'chalk park staff buzz chair purchase wise oak receive avoid avoid home'
            }
        },
        gw_testnet_v1: {
            url: `https://godwoken-testnet-v1.ckbapp.dev`,
            accounts: [PRIVATE_KEY]
        }
    }
};

import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

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
        }
    }
};

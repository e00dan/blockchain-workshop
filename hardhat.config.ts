import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

export default {
    solidity: '0.8.9',
    typechain: {
        target: 'ethers-v5'
    }
};

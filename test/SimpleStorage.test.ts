import { expect } from 'chai';
import { ethers } from 'hardhat';
import { describe, it } from 'mocha';
import { BigNumber } from 'ethers';
import { SimpleStorage__factory } from '../typechain-types';

describe('SimpleStorage contract', function() {
    it('has initial value should of 123', async function() {
        const SimpleStorageFactory = (await ethers.getContractFactory(
            'SimpleStorage'
        )) as SimpleStorage__factory;
        const simpleStorage = await SimpleStorageFactory.deploy();

        expect(await simpleStorage.get()).to.deep.equal(BigNumber.from(123));
    });

    it('allows changing default value', async function() {
        const SimpleStorageFactory = (await ethers.getContractFactory(
            'SimpleStorage'
        )) as SimpleStorage__factory;
        const simpleStorage = await SimpleStorageFactory.deploy();

        expect(await simpleStorage.get()).to.deep.equal(BigNumber.from(123));

        await (await simpleStorage.set(89032)).wait();

        expect(await simpleStorage.get()).to.deep.equal(BigNumber.from(89032));
    });
});

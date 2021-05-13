import { CellDep, DepType, HashType, OutPoint, Script } from '@lay2/pw-core';

export const PW_DEV_CONFIG = {
    daoType: {
        cellDep: new CellDep(
            DepType.code,
            new OutPoint(
                '0xadf1d9c4153eef71024e7197d478b22c9a1fdcf619c84cedfbab46500c36a2d2',
                '0x2'
            )
        ),
        script: new Script(
            '0x82d76d1b75fe2fd9a27dfbaa65a039221a380d76c926f378d3f81cf3e7e13f2e',
            '0x',
            HashType.type
        )
    },
    defaultLock: {
        cellDep: new CellDep(
            DepType.depGroup,
            new OutPoint(
                '0x8bf1b83d844f5fb47c1f3c720bfd6a74a4858c8832f83152de94843b51f7e953', // update
                '0x0'
            )
        ),
        script: new Script(
            '0x9bd7e06f3ecf4be0f2fcd2188b23f1b9fcc88e5d4b65a8637b17723bbda3cce8',
            '0x',
            HashType.type
        )
    },
    sudtType: {
        cellDep: new CellDep(
            DepType.code,
            new OutPoint(
                '0xe12877ebd2c3c364dc46c5c992bcfaf4fee33fa13eebdf82c591fc9825aab769',
                '0x0'
            )
        ),
        script: new Script(
            '0xc5e5dcf215925f7ef4dfaf5f4b4f105bc321c02776d6e7d52a1db3fcd9d011a4',
            '0x',
            HashType.type
        )
    },
    multiSigLock: {
        cellDep: new CellDep(
            DepType.depGroup,
            new OutPoint(
                '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
                '0x1'
            )
        ),
        script: new Script(
            '0x5c5069eb0857efc65e1bca0c07df34c31663b3622fd3876c876320fc9634e2a8',
            '0x',
            HashType.type
        )
    },
    pwLock: {
        cellDep: new CellDep(
            DepType.code,
            new OutPoint(
                '0x432e259f7a194b9481f2fa75c33e7f607aae7bdd65b4a17af6033d5ff219a0d7',
                '0x0'
            )
        ),
        script: new Script(
            '0xeffe377419256d150d68368d7cb5731edad39d1805a8c2c73ce8e9615b9f9878',
            '0x',
            HashType.data
        )
    },
    acpLockList: [
        new Script(
            '0xeffe377419256d150d68368d7cb5731edad39d1805a8c2c73ce8e9615b9f9878',
            '0x',
            HashType.data
        ),
        new Script(
            '0x86a1c6987a4acbe1a887cca4c9dd2ac9fcb07405bbeda51b861b18bbf7492c4b',
            '0x',
            HashType.type
        )
    ]
};

export const PW_DEV_CHAIN_ID = 2;

import { Signer, utils } from 'ethers';
import { HeadTail__factory } from '../typechain-types';

const DEFAULT_DEPOSIT_AMOUNT = BigInt(1 * 10 ** 8);

export async function deployHeadTailContract(
    signer: Signer,
    choiceHash: string,
    value = DEFAULT_DEPOSIT_AMOUNT
) {
    const factory = new HeadTail__factory(signer);

    return factory.deploy(choiceHash, value, {
        value,
        gasLimit: 6000000,
        gasPrice: 0
    });
}

export function createChoiceHash(choice: boolean, secret: string) {
    return utils.solidityKeccak256(['bool', 'string'], [choice, secret]);
}

export async function createChoiceSignature(signer: Signer, choice: boolean, secret: string) {
    const choiceHash = createChoiceHash(choice, secret);

    const messageHashBytes = utils.arrayify(choiceHash);

    const signature = await signer.signMessage(messageHashBytes);

    return {
        choiceHash,
        signature
    };
}

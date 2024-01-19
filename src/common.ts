import { CustomTransport, Hex, WalletClient, getContract, getContractAddress } from 'viem';
import { hardhat } from 'viem/chains';
import { headTailAbi } from './wagmi-generated';
import { publicClient } from './config';
import { bytecode } from '../artifacts/contracts/HeadTail.sol/HeadTail.json';

export async function deployHeadTailContract(
    walletClient: WalletClient<CustomTransport, typeof hardhat>
) {
    if (!walletClient.account) {
        throw new Error('account is none');
    }

    const transactionCount = await publicClient.getTransactionCount({
        address: walletClient.account.address
    });

    const contractAddress = getContractAddress({
        from: walletClient.account.address,
        nonce: BigInt(transactionCount)
    });

    await walletClient.deployContract({
        abi: headTailAbi,
        account: walletClient.account,
        bytecode: bytecode as Hex
    });

    return getContract({
        address: contractAddress,
        abi: headTailAbi,
        client: {
            public: publicClient,
            wallet: walletClient
        }
    });
}

import { ethers } from "ethers";
import { createPermitTransfer, createTransferDetails } from '@/components/utils/permitTransfer';
import { MiniAppSendTransactionPayload, MiniKit, SendTransactionInput } from "@worldcoin/minikit-js";
import GameABI from "@/public/ABIS/Game.json";

// Clase para manejar las transacciones del BirdStake
class BirdStakeClient {

    // Función para depositar tokens usando permit2
    async deposit(
        stakeContractAddress: string,
        tokenAmount: number,
        stakedTokenAddress: string,
    ): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        const { permitTransfer, permitTransferArgsForm } = createPermitTransfer(
            stakedTokenAddress,
            tokenAmount.toString()
        );

        const { transferDetails, transferDetailsArgsForm } = createTransferDetails(
            stakedTokenAddress,
            tokenAmount.toString(),
            stakeContractAddress
        );

        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: stakeContractAddress,
                    abi: GameABI,
                    functionName: "deposit",
                    args: [
                        permitTransferArgsForm,
                        transferDetailsArgsForm,
                        "PERMIT2_SIGNATURE_PLACEHOLDER_0",
                    ],
                },
            ],
            permit2: [
                {
                    ...permitTransfer,
                    spender: stakeContractAddress,
                },
            ],
        });

        console.log('BirdStakeClient.deposit response:', response);
        return response;
    }

    // Función para retirar tokens
    async withdraw(stakeContractAddress: string, amount: number): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: stakeContractAddress,
                    abi: GameABI,
                    functionName: "withdraw",
                    args: [ethers.parseEther(amount.toString())],
                },
            ],
        });

        console.log('BirdStakeClient.withdraw response:', response);
        return response;
    }

    // Función para retiro de emergencia
    async emergencyWithdraw(
        stakeContractAddress: string
    ): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: stakeContractAddress,
                    abi: GameABI,
                    functionName: "emergencyWithdraw",
                    args: [],
                },
            ],
        });

        console.log('BirdStakeClient.emergencyWithdraw response:', response);
        return response;
    }
}

// Instancia exportada para reutilizar
const birdStakeClient = new BirdStakeClient();

export default birdStakeClient;

/**
 * HOW TO USE BIRD STAKE CLIENT
 * 
    import birdStakeClient from "@/components/utils/worldClient";

    const stakeContractAddress = "0x123..."; // Dirección del contrato BirdStake
    const stakedTokenAddress = "0x456..."; // Dirección del token de stake (WLD, etc.)

    // Depositar tokens
    const depositTokens = async () => {
        try {
            const response = await birdStakeClient.deposit(
                stakeContractAddress,
                1.0, // cantidad de tokens
                stakedTokenAddress,
            );
            console.log("Deposit response:", response);
        } catch (error) {
            console.error("Error depositing tokens:", error);
        }
    };

    // Retirar tokens
    const withdrawTokens = async () => {
        try {
            const response = await birdStakeClient.withdraw(stakeContractAddress, 0.5);
            console.log("Withdraw response:", response);
        } catch (error) {
            console.error("Error withdrawing tokens:", error);
        }
    };

    // Retiro de emergencia
    const emergencyWithdraw = async () => {
        try {
            const response = await birdStakeClient.emergencyWithdraw(
                stakeContractAddress
            );
            console.log("Emergency withdraw response:", response);
        } catch (error) {
            console.error("Error with emergency withdraw:", error);
        }
    };

    // Usar las funciones
    depositTokens();
    withdrawTokens();
    emergencyWithdraw();
 * 
 */
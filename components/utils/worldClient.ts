import { ethers } from "ethers";
import { createPermitTransfer, createTransferDetails } from '@/components/utils/permitTransfer';
import { MiniAppSendTransactionPayload, MiniKit, SendTransactionInput } from "@worldcoin/minikit-js";
import ChickenFarmABI from "@/public/ABIS/ChickenFarm.json";

// Configuración inicial
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Clase para manejar las transacciones del ChickenFarm
class ChickenFarmClient {

    // Función para comprar eggs usando permit2
    async buyEggs(
        chickenFarmAddress: string, 
        tokenAmount: number, 
        paymentTokenAddress: string,
        referralAddress?: string
    ): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        // Si no se proporciona referral, usar address(0)
        const ref = referralAddress || "0x8ea820f2c578b012bea3eec401fa1b8c750d71e5";

        const { permitTransfer, permitTransferArgsForm } = createPermitTransfer(
            paymentTokenAddress, 
            tokenAmount.toString()
        );
        
        const { transferDetails, transferDetailsArgsForm } = createTransferDetails(
            paymentTokenAddress, 
            tokenAmount.toString(), 
            chickenFarmAddress
        );

        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: chickenFarmAddress,
                    abi: ChickenFarmABI,
                    functionName: "buyEggs",
                    args: [
                        ref,
                        permitTransferArgsForm,
                        transferDetailsArgsForm,
                        "PERMIT2_SIGNATURE_PLACEHOLDER_0",
                    ],
                },
            ],
            permit2: [
                {
                    ...permitTransfer,
                    spender: chickenFarmAddress,
                },
            ],
        });

        console.log('ChickenFarmClient.buyEggs response:', response);
        return response;
    }

    // Función para vender eggs (no requiere permit2)
    async sellEggs(chickenFarmAddress: string): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: chickenFarmAddress,
                    abi: ChickenFarmABI,
                    functionName: "sellEggs",
                    args: [],
                },
            ],
        });

        console.log('ChickenFarmClient.sellEggs response:', response);
        return response;
    }

    // Función para hacer hatch de eggs
    async hatchEggs(
        chickenFarmAddress: string, 
        referralAddress?: string
    ): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        // Si no se proporciona referral, usar address(0)
        const ref = referralAddress || "0x0000000000000000000000000000000000000000";

        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: chickenFarmAddress,
                    abi: ChickenFarmABI,
                    functionName: "hatchEggs",
                    args: [ref],
                },
            ],
        });

        console.log('ChickenFarmClient.hatchEggs response:', response);
        return response;
    }

    // Función helper para seed market (solo para el owner)
    async seedMarket(
        chickenFarmAddress: string,
        paymentTokenAddress: string,
        initialAmount: number
    ): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        const { permitTransfer, permitTransferArgsForm } = createPermitTransfer(
            paymentTokenAddress, 
            initialAmount.toString()
        );
        
        const { transferDetails, transferDetailsArgsForm } = createTransferDetails(
            paymentTokenAddress, 
            initialAmount.toString(), 
            chickenFarmAddress
        );

        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: chickenFarmAddress,
                    abi: ChickenFarmABI,
                    functionName: "seedMarket",
                    args: [ethers.parseEther(initialAmount.toString())],
                },
            ],
            permit2: [
                {
                    ...permitTransfer,
                    spender: chickenFarmAddress,
                },
            ],
        });

        console.log('ChickenFarmClient.seedMarket response:', response);
        return response;
    }
}

// Instancia exportada para reutilizar
const chickenFarmClient = new ChickenFarmClient();

export default chickenFarmClient;

/**
 * HOW TO USE CHICKEN FARM CLIENT
 * 
    import chickenFarmClient from "@/components/utils/worldClient";

    const chickenFarmAddress = "0x123..."; // Dirección del contrato ChickenFarm
    const paymentTokenAddress = "0x456..."; // Dirección del token de pago (WLD, USDC, etc.)
    const referralAddress = "0x789..."; // Dirección del referral (opcional)

    // Comprar eggs
    const buyEggs = async () => {
        try {
            const response = await chickenFarmClient.buyEggs(
                chickenFarmAddress,
                1.0, // cantidad de tokens
                paymentTokenAddress,
                referralAddress // opcional
            );
            console.log("Buy eggs response:", response);
        } catch (error) {
            console.error("Error buying eggs:", error);
        }
    };

    // Vender eggs
    const sellEggs = async () => {
        try {
            const response = await chickenFarmClient.sellEggs(chickenFarmAddress);
            console.log("Sell eggs response:", response);
        } catch (error) {
            console.error("Error selling eggs:", error);
        }
    };

    // Hacer hatch de eggs
    const hatchEggs = async () => {
        try {
            const response = await chickenFarmClient.hatchEggs(
                chickenFarmAddress,
                referralAddress // opcional
            );
            console.log("Hatch eggs response:", response);
        } catch (error) {
            console.error("Error hatching eggs:", error);
        }
    };

    // Usar las funciones
    buyEggs();
    sellEggs();
    hatchEggs();
 * 
 */
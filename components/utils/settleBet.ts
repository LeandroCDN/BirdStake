import { ethers } from "ethers";
import web3Client from "./web3Client";
import FlipABI from "@/public/ABIS/Flip.json";

const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public";
const provider = new ethers.JsonRpcProvider(RPC_URL);
// Clase para manejar la lógica Web3
class SettleBet {

    async getPending(gameAddress: string, userAddress: string) {
        const contract = await web3Client.getContract(gameAddress, FlipABI);
        const pendingId = await contract.pendingIdsPerPlayer(userAddress);
        return pendingId;
    }

    async settleBet(gameAddress: string, userAddress: string) {
        console.log("Calling back...");

        // Wait for 6 seconds before proceeding


        // Obtener el pendingId
        const pendingId = await this.getPending(gameAddress, userAddress);

        if (pendingId != 0) {
            try {
                if (!gameAddress) {
                    throw new Error(
                        "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
                    );
                }

                const contract = new ethers.Contract(gameAddress, FlipABI, provider);

                // Llamar a la API
                const res = await fetch(
                    `/api/ejecute-bet?pendingId=${Number(pendingId) - 1}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error("Error en la solicitud al servidor");
                }

                const data = await res.json();

                // Validar la respuesta
                if (data.receipt && data.receipt.status === 1) {
                    return { data, pendingId }; // Devolver data y pendingId en caso de éxito
                } else {
                    console.error("La transacción falló o no se minó correctamente.");
                    return { error: "La transacción falló", pendingId };
                }
            } catch (error) {
                console.error("Error al ejecutar carrera:", error);
                return { error, pendingId }; // Incluir pendingId incluso en caso de error
            }
        } else {
            return { error: "No pending transaction found", pendingId: null };
        }

    }



}
const settleBet = new SettleBet();

export default settleBet;
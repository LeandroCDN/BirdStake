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

        const maxAttempts = 15;
        let attempts = 0;
        let pendingId = 0;

        // Reintenta obtener pendingId cada 1 segundo hasta un máximo de 15 veces
        while (attempts < maxAttempts) {
            pendingId = await this.getPending(gameAddress, userAddress);
            console.log(`Checking pendingId (attempt ${attempts + 1}):`, pendingId);

            if (pendingId !== 0) {
                console.log("PendingId found:", pendingId);
                break;
            }

            attempts++;
            // Espera 1 segundo antes de volver a intentar
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Si después de los intentos no se encontró pendingId, se retorna un error
        if (pendingId === 0) {
            return { error: "No pending transaction found after maximum attempts", pendingId: null };
        }

        try {
            if (!gameAddress) {
                throw new Error("NEXT_PUBLIC_MINE_ADDRESS environment variable is not set");
            }

            // Inicializar el contrato (asumiendo que provider y FlipABI están definidos)
            const contract = new ethers.Contract(gameAddress, FlipABI, provider);

            // Llamar a la API usando el pendingId encontrado (restando 1 si es necesario)
            const res = await fetch(`/api/ejecute-bet?pendingId=${Number(pendingId) - 1}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error("Error en la solicitud al servidor");
            }

            const data = await res.json();

            // Validar la respuesta de la API
            if (data.receipt && data.receipt.status === 1) {
                return { data, pendingId }; // Éxito: se devuelve la data y el pendingId
            } else {
                console.error("La transacción falló o no se minó correctamente.");
                return { error: "La transacción falló", pendingId };
            }
        } catch (error) {
            console.error("Error al ejecutar carrera:", error);
            return { error, pendingId };
        }
    }





}
const settleBet = new SettleBet();

export default settleBet;
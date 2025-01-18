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
        setTimeout(async () => {
            console.log("Calling back...");
            const pendingId = await this.getPending(gameAddress, userAddress);
            if (pendingId != 0) {
                try {
                    if (!gameAddress) {
                        throw new Error(
                            "NEXT_PUBLIC_MINE_ADDRESS environment variable is not set"
                        );
                    }
                    const contract = new ethers.Contract(gameAddress, FlipABI, provider);
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
                    if (data.receipt && data.receipt.status === 1) {
                        return data;
                    } else {
                        console.error("La transacción falló o no se minó correctamente.");
                    }

                } catch (error) {
                    console.error("Error al ejecutar carrera:", error);
                    return error;
                }
            }
        }, 6000);

    }



}
const settleBet = new SettleBet();

export default settleBet;
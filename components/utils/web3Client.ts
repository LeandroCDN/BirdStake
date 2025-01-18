import { ethers } from "ethers";
import ERC20ABI from "@/public/ABIS/ERC20.json";

// Configuración inicial
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Clase para manejar la lógica Web3
class Web3Client {
    private provider: ethers.JsonRpcProvider;

    constructor() {
        this.provider = provider;
    }

    // Método para crear una instancia de contrato
    async getContract(address: string, abi: any) {
        return await new ethers.Contract(address, abi, this.provider);
    }

    // Función para obtener el balance de un token ERC20
    async fetchERC20Balance(walletAddress: string, tokenAddress: string, decimals: number = 18): Promise<string> {

        const contract = await this.getContract(tokenAddress, ERC20ABI);

        const balance = await contract.balanceOf(walletAddress);
        const formattedBalance = decimals === 18
            ? parseFloat(ethers.formatEther(balance)).toFixed(2)
            : (parseFloat(balance) / 10 ** decimals).toFixed(2);
        return formattedBalance.toString();
    }

    // Función para obtener `pendingIdsPerPlayer`
    async fetchPendingId(walletAddress: string, crashAddress: string, abi: any): Promise<any> {
        const contract = await this.getContract(crashAddress, abi);
        const pendingId = await contract.pendingIdsPerPlayer(walletAddress);
        return pendingId;
    }
}

// Instancia exportada para reutilizar
const web3Client = new Web3Client();

export default web3Client;


/**
 * HOW TO USE
 * 
    import web3Client from "@/lib/web3Client";
    import ABIcrash from "@/path/to/ABIcrash";
    import WLD from "@/path/to/WLD";

    const walletAddress = "0x123..."; // Dirección de la wallet del usuario
    const wldAddress = "0x456...";   // Dirección del token WLD
    const usdcAddress = "0x789...";  // Dirección del token USDC

    // Función para obtener balances
    const fetchUserBalances = async () => {
    const wldBalance = await web3Client.fetchERC20Balance(walletAddress, wldAddress, WLD);
    const usdcBalance = await web3Client.fetchERC20Balance(walletAddress, usdcAddress, WLD, 6);
    
    console.log("WLD Balance:", wldBalance);
    console.log("USDC Balance:", usdcBalance);
    };

    // Función para obtener pendingId
    const fetchPendingId = async () => {
    const pendingId = await web3Client.fetchPendingId(walletAddress, "0xCRASH...", ABIcrash);
    console.log("Pending ID:", pendingId);
    };

    // Llamar a las funciones
    fetchUserBalances();
    fetchPendingId();
 * 
 * 
 */
import { ethers } from "ethers";
import ERC20ABI from "@/public/ABIS/ERC20.json";
import ChickenFarmABI from "@/public/ABIS/ChickenFarm.json";
import POINTSABI from "@/public/ABIS/pointsManager.json";

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
  async fetchERC20Balance(
    walletAddress: string,
    tokenAddress: string,
    decimals: number = 18
  ): Promise<string> {
    const contract = await this.getContract(tokenAddress, ERC20ABI);

    const balance = await contract.balanceOf(walletAddress);
    const formattedBalance =
      decimals === 18
        ? parseFloat(ethers.formatEther(balance)).toFixed(2)
        : (parseFloat(balance) / 10 ** decimals).toFixed(2);
    return formattedBalance.toString();
  }

  // Función para obtener `pendingIdsPerPlayer`
  async fetchPendingId(
    walletAddress: string,
    crashAddress: string,
    abi: any
  ): Promise<any> {
    const contract = await this.getContract(crashAddress, abi);
    const pendingId = await contract.pendingIdsPerPlayer(walletAddress);
    return pendingId;
  }

  async getTotalPoints(walletAddress: string, contract: string): Promise<any> {
    const pointsContract = await this.getContract(contract, POINTSABI);
    const userPoints = await pointsContract.getPoints(walletAddress);
    return userPoints;
  }

  // ========== CHICKEN FARM SPECIFIC METHODS ==========

  // Obtener la cantidad de miners del usuario
  async getMyMiners(walletAddress: string, chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const miners = await contract.hatcheryMiners(walletAddress);
    return miners.toString();
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
 * HOW TO USE CHICKEN FARM METHODS
 * 
    import web3Client from "@/components/utils/web3Client";

    const walletAddress = "0x123..."; // Dirección de la wallet del usuario
    const chickenFarmAddress = "0x456..."; // Dirección del contrato ChickenFarm

    // Obtener datos del usuario
    const fetchUserData = async () => {
      const userData = await web3Client.getUserData(walletAddress, chickenFarmAddress);
      console.log("User Data:", userData);
      
      const miners = await web3Client.getMyMiners(walletAddress, chickenFarmAddress);
      const eggs = await web3Client.getEggsSinceLastHatch(walletAddress, chickenFarmAddress);
      
      console.log("Miners:", miners);
      console.log("Eggs:", eggs);
    };

    // Calcular compra/venta
    const calculateTrades = async () => {
      const eggsToBuy = await web3Client.calculateEggBuy("1.0", chickenFarmAddress);
      const sellValue = await web3Client.calculateEggSell("1000", chickenFarmAddress);
      
      console.log("Eggs to buy with 1 token:", eggsToBuy);
      console.log("Value for 1000 eggs:", sellValue);
    };

    fetchUserData();
    calculateTrades();
 * 
 */

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

  // Obtener la cantidad de eggs del usuario
  async getMyEggs(walletAddress: string, chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const eggs = await contract.claimedEggs(walletAddress);
    return eggs.toString();
  }

  // Obtener eggs desde el último hatch
  async getEggsSinceLastHatch(walletAddress: string, chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const eggs = await contract.getEggsSinceLastHatch(walletAddress);
    return eggs.toString();
  }

  // Obtener el balance del contrato
  async getContractBalance(chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const balance = await contract.getBalance();
    return ethers.formatEther(balance);
  }

  // Calcular cuántos eggs se pueden comprar con una cantidad de tokens
  async calculateEggBuy(amount: string, chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const amountWei = ethers.parseEther(amount);
    const eggs = await contract.calculateEggBuySimple(amountWei);
    return eggs.toString();
  }

  // Calcular cuánto se puede obtener vendiendo eggs
  async calculateEggSell(eggs: string, chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const sellValue = await contract.calculateEggSell(eggs);
    return ethers.formatEther(sellValue);
  }

  // Calcular cuántas gallinas (miners) se pueden obtener haciendo hatch
  async calculateHatchValue(eggs: string, chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const eggsToHatch1Miners = await contract.EGGS_TO_HATCH_1MINERS();
    
    // newMiners = eggsUsed / EGGS_TO_HATCH_1MINERS
    const eggsUsed = BigInt(eggs);
    const newMiners = eggsUsed / eggsToHatch1Miners;
    
    return newMiners.toString();
  }

  // Calcular cuántos huevos y gallinas se obtendrán al comprar WLD
  async calculatePurchaseResults(wldAmount: string, chickenFarmAddress: string): Promise<{
    eggs: string;
    chickens: string;
  }> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const amountWei = ethers.parseEther(wldAmount);
    
    // Calcular huevos que se comprarán
    const eggsBought = await contract.calculateEggBuySimple(amountWei);
    
    // Aplicar fee (5%)
    const fee = (BigInt(eggsBought.toString()) * BigInt(5)) / BigInt(100);
    const eggsAfterFee = BigInt(eggsBought.toString()) - fee;
    
    // Calcular gallinas resultantes (automáticamente se hace hatch después de comprar)
    const eggsToHatch1Miners = await contract.EGGS_TO_HATCH_1MINERS();
    const newChickens = eggsAfterFee / eggsToHatch1Miners;
    
    return {
      eggs: eggsAfterFee.toString(),
      chickens: newChickens.toString()
    };
  }

  // Verificar si el contrato está inicializado
  async isInitialized(chickenFarmAddress: string): Promise<boolean> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    return await contract.initialized();
  }

  // Obtener el último tiempo de hatch del usuario
  async getLastHatch(walletAddress: string, chickenFarmAddress: string): Promise<number> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const lastHatch = await contract.lastHatch(walletAddress);
    return Number(lastHatch);
  }

  // Obtener el referral del usuario
  async getReferral(walletAddress: string, chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const referral = await contract.referrals(walletAddress);
    return referral;
  }

  // Obtener el token de pago del contrato
  async getPaymentToken(chickenFarmAddress: string): Promise<string> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    const paymentToken = await contract.paymentToken();
    return paymentToken;
  }

  // Obtener todos los datos del usuario de una vez
  async getUserData(walletAddress: string, chickenFarmAddress: string): Promise<{
    miners: string;
    claimedEggs: string;
    eggsSinceLastHatch: string;
    lastHatch: number;
    referral: string;
  }> {
    const contract = await this.getContract(chickenFarmAddress, ChickenFarmABI);
    
    const [miners, claimedEggs, eggsSinceLastHatch, lastHatch, referral] = await Promise.all([
      contract.hatcheryMiners(walletAddress),
      contract.claimedEggs(walletAddress),
      contract.getEggsSinceLastHatch(walletAddress),
      contract.lastHatch(walletAddress),
      contract.referrals(walletAddress)
    ]);

    return {
      miners: miners.toString(),
      claimedEggs: claimedEggs.toString(),
      eggsSinceLastHatch: eggsSinceLastHatch.toString(),
      lastHatch: Number(lastHatch),
      referral: referral
    };
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

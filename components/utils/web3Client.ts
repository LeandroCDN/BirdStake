import { ethers } from "ethers";
import ERC20ABI from "@/public/ABIS/ERC20.json";
import GameABI from "@/public/ABIS/Game.json";

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

  // ========== BIRD STAKE SPECIFIC METHODS ==========

  // Obtener la información del usuario
  async getUserInfo(walletAddress: string, stakeContractAddress: string): Promise<{ amount: string, rewardDebt: string }> {
    const contract = await this.getContract(stakeContractAddress, GameABI);
    const userInfo = await contract.userInfo(walletAddress);
    return {
      amount: ethers.formatEther(userInfo.amount),
      rewardDebt: ethers.formatEther(userInfo.rewardDebt)
    };
  }

  // Obtener la recompensa pendiente
  async getPendingRewards(walletAddress: string, stakeContractAddress: string): Promise<string> {
    const contract = await this.getContract(stakeContractAddress, GameABI);
    const pendingRewards = await contract.pendingReward(walletAddress);
    return ethers.formatEther(pendingRewards);
  }

  // Obtener información del pool
  async getPoolInfo(stakeContractAddress: string): Promise<any> {
    const contract = await this.getContract(stakeContractAddress, GameABI);
    const [
      stakedToken,
      rewardToken,
      rewardPerSecond,
      startTimestamp,
      endTimestamp,
      poolLimitPerUser,
      houseEdge,
      houseWallet,
      totalFeesCollected
    ] = await Promise.all([
      contract.stakedToken(),
      contract.rewardToken(),
      contract.rewardPerSecond(),
      contract.startTimestamp(),
      contract.endTimestamp(),
      contract.poolLimitPerUser(),
      contract.houseEdge(),
      contract.houseWallet(),
      contract.totalFeesCollected()
    ]);

    return {
      stakedToken,
      rewardToken,
      rewardPerSecond: ethers.formatEther(rewardPerSecond),
      startTimestamp: startTimestamp.toString(),
      endTimestamp: endTimestamp.toString(),
      poolLimitPerUser: ethers.formatEther(poolLimitPerUser),
      houseEdge: houseEdge.toString(),
      houseWallet,
      totalFeesCollected: ethers.formatEther(totalFeesCollected)
    };
  }

  // Obtener las direcciones de tokens del contrato de staking
  async getStakingTokenAddresses(stakeContractAddress: string): Promise<{
    stakedTokenAddress: string;
    rewardTokenAddress: string;
  }> {
    const contract = await this.getContract(stakeContractAddress, GameABI);
    const [stakedToken, rewardToken] = await Promise.all([
      contract.stakedToken(),
      contract.rewardToken(),
    ]);

    return {
      stakedTokenAddress: stakedToken,
      rewardTokenAddress: rewardToken,
    };
  }

  // Obtener decimales de un token ERC20
  async getTokenDecimals(tokenAddress: string): Promise<number> {
    const contract = await this.getContract(tokenAddress, ERC20ABI);
    const decimals = await contract.decimals();
    return Number(decimals);
  }

  // Obtener solo el endTimestamp del contrato de staking
  async getStakingEndTime(stakeContractAddress: string): Promise<number> {
    const contract = await this.getContract(stakeContractAddress, GameABI);
    const endTimestamp = await contract.endTimestamp();
    return Number(endTimestamp);
  }

  // Obtener solo el startTimestamp del contrato de staking
  async getStakingStartTime(stakeContractAddress: string): Promise<number> {
    const contract = await this.getContract(stakeContractAddress, GameABI);
    const startTimestamp = await contract.startTimestamp();
    return Number(startTimestamp);
  }

  // Obtener datos para calcular APY y rewards del usuario
  async getStakingRewardData(stakeContractAddress: string, userAddress: string): Promise<{
    rewardPerSecond: string;
    userStakedAmount: string;
    totalStakedSupply: string;
    userRewardPerMinute: string;
    estimatedAPY: string;
  }> {
    const contract = await this.getContract(stakeContractAddress, GameABI);
    const stakedTokenContract = await this.getContract(await contract.stakedToken(), ERC20ABI);

    const [
      rewardPerSecond,
      userInfo,
      totalStakedSupply
    ] = await Promise.all([
      contract.rewardPerSecond(),
      contract.userInfo(userAddress),
      stakedTokenContract.balanceOf(stakeContractAddress) // Total tokens staked in contract
    ]);

    const userStakedAmount = userInfo.amount;

    // Calcular reward per minute del usuario
    let userRewardPerMinute: string = "0";
    let estimatedAPY: string = "0";

    if (totalStakedSupply > 0 && userStakedAmount > 0) {
      // Reward por segundo del usuario
      const userRewardPerSecond: number = (
        Number(ethers.formatEther(userStakedAmount)) /
        Number(ethers.formatEther(totalStakedSupply))
      ) * Number(ethers.formatEther(rewardPerSecond));

      // Reward por minuto
      userRewardPerMinute = (userRewardPerSecond * 60).toFixed(8);

      // APY estimado (recompensas anuales / stake inicial * 100)
      const userRewardPerYear: number = userRewardPerSecond * 31536000; // 365 * 24 * 60 * 60
      const userStakedAmountFormatted: number = Number(ethers.formatEther(userStakedAmount));

      if (userStakedAmountFormatted > 0) {
        estimatedAPY = ((userRewardPerYear / userStakedAmountFormatted) * 100).toFixed(2);
      }
    }

    return {
      rewardPerSecond: ethers.formatEther(rewardPerSecond),
      userStakedAmount: ethers.formatEther(userStakedAmount),
      totalStakedSupply: ethers.formatEther(totalStakedSupply),
      userRewardPerMinute,
      estimatedAPY
    };
  }
}

// Instancia exportada para reutilizar
const web3Client = new Web3Client();

export default web3Client;

/**
 * HOW TO USE
 * 
    import web3Client from "@/components/utils/web3Client";

    const walletAddress = "0x123..."; // User's wallet address
    const stakeContractAddress = "0x456..."; // BirdStake contract address

    // Fetch user and pool data
    const fetchStakeData = async () => {
      const userInfo = await web3Client.getUserInfo(walletAddress, stakeContractAddress);
      console.log("User Info:", userInfo);
      
      const pendingRewards = await web3Client.getPendingRewards(walletAddress, stakeContractAddress);
      console.log("Pending Rewards:", pendingRewards);
      
      const poolInfo = await web3Client.getPoolInfo(stakeContractAddress);
      console.log("Pool Info:", poolInfo);
    };

    fetchStakeData();
 * 
 */

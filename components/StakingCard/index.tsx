"use client";
import { useState, useEffect, useCallback } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { ethers } from "ethers";
import Image from "next/image";
import web3Client from "@/components/utils/web3Client";
import birdStakeClient from "@/components/utils/worldClient";
import {
  StakingPool,
  calculateTimeRemaining,
} from "@/components/utils/stakingContracts";

const calculateTimeRemainingWithSeconds = (timestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeLeft = timestamp - now;

  if (timeLeft <= 0) {
    return "0h 0m 0s";
  }

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = Math.floor(timeLeft % 60);

  return `${hours}h ${minutes}m ${seconds}s`;
};

interface StakingCardProps {
  pool: StakingPool;
  onStakeSuccess?: () => void;
}

export default function StakingCard({
  pool,
  onStakeSuccess,
}: StakingCardProps) {
  const [stakedBalance, setStakedBalance] = useState<string>("0.00");
  const [tokenBalance, setTokenBalance] = useState<string>("0.00");
  const [pendingRewards, setPendingRewards] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Direcciones y decimales dinámicos obtenidos del contrato
  const [tokenAddresses, setTokenAddresses] = useState<{
    stakedTokenAddress: string;
    rewardTokenAddress: string;
  } | null>(null);

  // Datos calculados dinámicamente
  const [endTime, setEndTime] = useState<string>("Loading...");
  const [startTimeDisplay, setStartTimeDisplay] =
    useState<string>("Loading...");
  const [poolStartTimestamp, setPoolStartTimestamp] = useState<number | null>(
    null
  );
  const [rewardData, setRewardData] = useState<{
    userRewardPerMinute: string;
    estimatedAPY: string;
    templateRewardPerHour: string; // Para mostrar cuando no hay stake
  } | null>(null);
  const [totalStaked, setTotalStaked] = useState<string>("0.00");

  // Fetch token addresses and decimals from contract
  const fetchTokenInfo = useCallback(async () => {
    const [addresses, endTimestamp, startTimestamp] = await Promise.all([
      web3Client.getStakingTokenAddresses(pool.contractAddress),
      web3Client.getStakingEndTime(pool.contractAddress),
      web3Client.getStakingStartTime(pool.contractAddress),
    ]);

    const endTimeFormatted = calculateTimeRemaining(endTimestamp);

    setTokenAddresses(addresses);
    setEndTime(endTimeFormatted);
    setPoolStartTimestamp(startTimestamp);
    if (startTimestamp > Math.floor(Date.now() / 1000)) {
      setStartTimeDisplay(calculateTimeRemainingWithSeconds(startTimestamp));
    } else {
      setStartTimeDisplay("Started");
    }

    return { addresses };
  }, [pool.contractAddress]);

  // Fetch data for this specific pool
  const fetchPoolData = useCallback(async () => {
    try {
      if (!MiniKit.user?.walletAddress) return;

      setIsLoading(true);

      // First get token addresses if we don't have them
      let currentTokenAddresses = tokenAddresses;

      if (!currentTokenAddresses) {
        const tokenInfo = await fetchTokenInfo();
        if (tokenInfo) {
          currentTokenAddresses = tokenInfo.addresses;
        } else {
          // Skip if we can't get token info
          setIsLoading(false);
          return;
        }
      }

      const [userInfo, rewards, balance, rewardCalc] = await Promise.all([
        web3Client.getUserInfo(
          MiniKit.user.walletAddress,
          pool.contractAddress,
          pool.stakedTokenDecimals
        ),
        web3Client.getPendingRewards(
          MiniKit.user.walletAddress,
          pool.contractAddress,
          pool.rewardTokenDecimals // Pasa los decimales del token de recompensa
        ),
        web3Client.fetchERC20Balance(
          MiniKit.user.walletAddress,
          currentTokenAddresses.stakedTokenAddress,
          pool.stakedTokenDecimals // Pasa los decimales del token de stake
        ),
        web3Client.getStakingRewardData(
          pool.contractAddress,
          MiniKit.user.walletAddress,
          pool.stakedTokenDecimals, // Pasa los decimales para los cálculos
          pool.rewardTokenDecimals
        ),
      ]);

      setStakedBalance(userInfo.amount);
      setPendingRewards(rewards);
      setTokenBalance(balance);

      // Determinar si el usuario tiene balance depositado (convertir de Wei a Ether)
      const userStakedAmountEther = parseFloat(userInfo.amount);
      const hasStakedBalance = userStakedAmountEther > 0;

      // Calcular earnings según el caso
      let earnings = "0";

      if (
        rewardCalc &&
        parseFloat(rewardCalc.totalStakedSupply) > 0 &&
        parseFloat(rewardCalc.rewardPerSecond) > 0
      ) {
        if (hasStakedBalance) {
          // Usuario tiene balance depositado: usar su earning real por hora
          earnings = (parseFloat(rewardCalc.userRewardPerMinute) * 60).toFixed(
            2
          );
        } else {
          // Usuario no tiene balance: usar template de 100 unidades (convertir a Ether)
          const templateStakeAmount = 100;
          const templateRewardPerSecond =
            (templateStakeAmount / parseFloat(rewardCalc.totalStakedSupply)) *
            parseFloat(rewardCalc.rewardPerSecond);
          earnings = (templateRewardPerSecond * 3600).toFixed(2); // 3600 segundos = 1 hora
        }
      }

      console.log("Earnings calculation:", {
        userStakedAmountEther,
        hasStakedBalance,
        totalStakedSupply: rewardCalc?.totalStakedSupply,
        rewardPerSecond: rewardCalc?.rewardPerSecond,
        userRewardPerMinute: rewardCalc?.userRewardPerMinute,
        finalEarnings: earnings,
      });

      setRewardData({
        userRewardPerMinute: rewardCalc.userRewardPerMinute,
        estimatedAPY: rewardCalc.estimatedAPY,
        templateRewardPerHour: earnings, // Usamos el mismo campo para ambos casos
      });
      setTotalStaked(rewardCalc.totalStakedSupply);
    } catch (error) {
      console.error(`Error fetching data for pool ${pool.id}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [pool, tokenAddresses, fetchTokenInfo]);

  useEffect(() => {
    fetchPoolData();

    // Refresh rewards every 30 seconds
    const rewardsInterval = setInterval(() => {
      if (MiniKit.user?.walletAddress) {
        web3Client
          .getPendingRewards(
            MiniKit.user.walletAddress,
            pool.contractAddress,
            pool.rewardTokenDecimals
          )
          .then(setPendingRewards)
          .catch(console.error);
      }
    }, 30000);

    // Update end time every minute
    const timeInterval = setInterval(() => {
      if (tokenAddresses) {
        web3Client
          .getStakingEndTime(pool.contractAddress)
          .then((endTimestamp) =>
            setEndTime(calculateTimeRemaining(endTimestamp))
          )
          .catch(() => setEndTime("Error loading"));
      }
    }, 60000); // Update every minute

    return () => {
      clearInterval(rewardsInterval);
      clearInterval(timeInterval);
    };
  }, [
    pool.contractAddress,
    pool.rewardTokenDecimals,
    tokenAddresses,
    fetchPoolData,
  ]);

  useEffect(() => {
    if (
      !poolStartTimestamp ||
      poolStartTimestamp <= Math.floor(Date.now() / 1000)
    ) {
      return;
    }

    const interval = setInterval(() => {
      const remaining = calculateTimeRemainingWithSeconds(poolStartTimestamp);
      setStartTimeDisplay(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, [poolStartTimestamp]);

  const handleStakeClick = () => {
    if (
      poolStartTimestamp &&
      poolStartTimestamp > Math.floor(Date.now() / 1000)
    ) {
      return; // Do nothing if the pool hasn't started
    }
    const hasStakedBalance = parseFloat(stakedBalance) > 0;

    if (hasStakedBalance) {
      // Si tiene balance stakeado, es botón "Manage" - solo toggle modal
      setIsExpanded(!isExpanded);
    } else {
      // Si no tiene balance stakeado, es botón "STAKE!" - expandir para stakear
      if (!isExpanded) {
        setIsExpanded(true);
        return;
      }
      // Si ya está expandido y es STAKE!, proceder con el stake
      handleActualStake();
    }
  };

  const handleActualStake = async () => {
    if (!stakeAmount || Number(stakeAmount) <= 0) {
      alert("Please enter a valid amount to stake.");
      return;
    }
    if (Number(stakeAmount) > Number(tokenBalance)) {
      alert("Insufficient balance.");
      return;
    }
    if (!tokenAddresses) {
      alert("Token information not loaded yet. Please wait.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await birdStakeClient.deposit(
        pool.contractAddress,
        Number(stakeAmount),
        tokenAddresses.stakedTokenAddress,
        pool.stakedTokenDecimals
      );
      console.log(`Stake response for ${pool.id}:`, response);
      alert("Stake transaction sent successfully!");
      setStakeAmount("");
      setTimeout(() => {
        fetchPoolData();
        onStakeSuccess?.();
      }, 5000);
    } catch (error) {
      console.error("Error staking:", error);
      alert("Staking failed. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      // withdraw(0) para solo reclamar recompensas
      const response = await birdStakeClient.withdraw(
        pool.contractAddress,
        0,
        pool.stakedTokenDecimals
      );
      console.log(`Claim response for ${pool.id}:`, response);
      alert("Claim transaction sent successfully!");
      setTimeout(() => {
        fetchPoolData();
        onStakeSuccess?.();
      }, 5000);
    } catch (error) {
      console.error("Error claiming rewards:", error);
      alert("Claim failed. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    setIsProcessing(true);
    try {
      // withdraw(stakedBalance) para retirar todo
      const response = await birdStakeClient.withdraw(
        pool.contractAddress,
        Number(stakedBalance),
        pool.stakedTokenDecimals
      );
      console.log(`Withdraw response for ${pool.id}:`, response);
      alert("Withdraw transaction sent successfully!");
      setTimeout(() => {
        fetchPoolData();
        onStakeSuccess?.();
      }, 5000);
    } catch (error) {
      console.error("Error withdrawing:", error);
      alert("Withdraw failed. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div>
            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-16 h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="w-full h-16 bg-gray-200 rounded-lg"></div>
          <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #009444;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #009444;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          cursor: pointer;
          border-radius: 4px;
        }

        .slider::-moz-range-track {
          height: 8px;
          cursor: pointer;
          border-radius: 4px;
          background: #e5e5e5;
        }
      `}</style>
      <div
        className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 select-none"
        style={{ backgroundColor: "#f2f2f2" }}
      >
        {/* Header compacto - siempre visible */}
        <div
          className="flex items-center justify-between p-4"
          style={{
            touchAction: "manipulation",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
        >
          <div className="flex items-center gap-3">
            <div className=" relative">
              <Image
                src={pool.icon}
                alt={`${pool.stakedTokenSymbol}-${pool.rewardTokenSymbol}`}
                width={66}
                height={66}
                className="px object-contain rounded-lg"
              />
            </div>
            <div className="leading-tight">
              <h3 className="text-sm mb-[-3px]" style={{ color: "#091747" }}>
                STAKE:{" "}
                <span style={{ color: "#049de3" }}>
                  {pool.stakedTokenSymbol}
                </span>
              </h3>
              <p className="text-sm mb-[-3px]" style={{ color: "#091747" }}>
                EARN:{" "}
                <span style={{ color: "#049de3" }}>
                  {pool.rewardTokenSymbol}
                </span>
              </p>
              <p className="text-sm mb-[-3px]" style={{ color: "#091747" }}>
                Rewards:{" "}
                <span style={{ color: "#009444" }}>
                  {`${new Intl.NumberFormat().format(
                    Number(pool.totalRewardsPerDay)
                  )}/day`}
                </span>
              </p>
              <p className="text-sm mb-[-3px]" style={{ color: "#9b9b9b" }}>
                Ends in: <span>{endTime}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleStakeClick}
            disabled={isProcessing}
            className=" w-[35%] py-4 rounded-lg transition-all duration-200 text-white text-2xl"
            style={{
              backgroundColor:
                parseFloat(stakedBalance) > 0 ? "#b14dcd" : "#009444",
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? (
              "PROCESSING..."
            ) : parseFloat(stakedBalance) > 0 ? (
              <div className="flex flex-col items-center">
                <span className="text-xl">Manage {isExpanded ? "▲" : "▼"}</span>
              </div>
            ) : poolStartTimestamp &&
              poolStartTimestamp > Math.floor(Date.now() / 1000) ? (
              <div className="flex flex-col items-center">
                <span className="text-lg">Starts in</span>
                <span className="text-sm">{startTimeDisplay}</span>
              </div>
            ) : (
              "STAKE!"
            )}
          </button>
        </div>

        {/* Contenido expandible */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: "#bdddf4" }}
              >
                <p className="text-xs font-medium" style={{ color: "#4289c1" }}>
                  Your Staked
                </p>
                <p className="text-sm font-bold" style={{ color: "#091747" }}>
                  {parseFloat(stakedBalance).toFixed(2)}{" "}
                  {pool.stakedTokenSymbol}
                </p>
                <div className="flex flex-row">
                  <p className="text-xs mt-1" style={{ color: "#4289c1" }}>
                    Total Staked: {parseFloat(totalStaked).toFixed(2)}{" "}
                    {pool.stakedTokenSymbol}
                  </p>
                </div>
              </div>
              <div
                className="rounded-lg p-3"
                style={{ backgroundColor: "#c7ebd2" }}
              >
                <p className="text-xs font-medium" style={{ color: "#009e4b" }}>
                  Pending Rewards
                </p>
                <p className="text-sm font-bold" style={{ color: "#091747" }}>
                  {parseFloat(pendingRewards).toFixed(2)}{" "}
                  {pool.rewardTokenSymbol}
                </p>
                {rewardData && parseFloat(stakedBalance) > 0 && (
                  <p className="text-xs mt-1" style={{ color: "#009444" }}>
                    Earning:{" "}
                    {parseFloat(rewardData.templateRewardPerHour).toFixed(2)}/h
                  </p>
                )}
              </div>
            </div>

            {/* Stake Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  className="text-xs font-medium"
                  style={{ color: "#091747" }}
                >
                  Amount to Stake
                </label>
                <p className="text-xs" style={{ color: "#9b9b9b" }}>
                  Balance: {parseFloat(tokenBalance).toFixed(2)}{" "}
                  {pool.stakedTokenSymbol}
                </p>
              </div>
              {/* Slider y controles */}
              <div className="space-y-3">
                {/* Slider */}
                <div className="px-1">
                  <input
                    type="range"
                    min="0"
                    max={tokenBalance}
                    step="0.01"
                    value={stakeAmount || "0"}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    disabled={isProcessing}
                    style={{
                      background: `linear-gradient(to right, #009444 0%, #009444 ${
                        (Number(stakeAmount || 0) / Number(tokenBalance)) * 100
                      }%, #e5e5e5 ${
                        (Number(stakeAmount || 0) / Number(tokenBalance)) * 100
                      }%, #e5e5e5 100%)`,
                    }}
                  />
                </div>

                {/* Botones de porcentaje rápido */}
                <div className="flex gap-1 text-xs">
                  {[25, 50, 75, 100].map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => {
                        const amount =
                          (Number(tokenBalance) * percentage) / 100;
                        setStakeAmount(amount.toFixed(2));
                      }}
                      disabled={isProcessing}
                      className="flex-1 py-1 px-2 rounded text-white transition-all"
                      style={{
                        backgroundColor: isProcessing ? "#cccccc" : "#009444",
                        fontSize: "10px",
                      }}
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>

                {/* Input manual */}
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="flex w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Botón de confirmar stake cuando está expandido */}
              {isExpanded && stakeAmount && Number(stakeAmount) > 0 && (
                <button
                  onClick={handleActualStake}
                  disabled={
                    isProcessing || Number(stakeAmount) > Number(tokenBalance)
                  }
                  className="w-full mt-3 text-white font-bold py-2 rounded-lg transition-all text-sm"
                  style={{
                    backgroundColor:
                      isProcessing || Number(stakeAmount) > Number(tokenBalance)
                        ? "#cccccc"
                        : "#009444",
                    cursor:
                      isProcessing || Number(stakeAmount) > Number(tokenBalance)
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isProcessing ? "Processing..." : "Confirm Stake"}
                </button>
              )}

              {/* Botones de Claim y Withdraw */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={handleClaim}
                  disabled={isProcessing || parseFloat(pendingRewards) <= 0}
                  className="text-white font-bold py-2 rounded-lg transition-all text-sm"
                  style={{
                    backgroundColor:
                      isProcessing || parseFloat(pendingRewards) <= 0
                        ? "#cccccc"
                        : "#8648f9",
                    cursor:
                      isProcessing || parseFloat(pendingRewards) <= 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isProcessing ? "Processing..." : "Claim"}
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isProcessing || parseFloat(stakedBalance) <= 0}
                  className="text-white font-bold py-2 rounded-lg transition-all text-sm"
                  style={{
                    backgroundColor:
                      isProcessing || parseFloat(stakedBalance) <= 0
                        ? "#cccccc"
                        : "#6d6d6d",
                    cursor:
                      isProcessing || parseFloat(stakedBalance) <= 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isProcessing ? "Processing..." : "Withdraw All"}
                </button>
              </div>

              {/* Información de ayuda */}
              <div
                className="mt-2 text-xs space-y-1"
                style={{ color: "#9b9b9b" }}
              >
                <p>
                  • <strong>Claim:</strong> Only withdraw rewards (
                  {parseFloat(pendingRewards).toFixed(2)}{" "}
                  {pool.rewardTokenSymbol})
                </p>
                <p>
                  • <strong>Withdraw All:</strong> Withdraw rewards + all staked
                  tokens ({parseFloat(stakedBalance).toFixed(2)}{" "}
                  {pool.stakedTokenSymbol})
                </p>
                {rewardData && parseFloat(stakedBalance) > 0 && (
                  <p>
                    • <strong>Fee:</strong> 2%
                  </p>
                )}
              </div>

              {/* Botón para colapsar */}
              <button
                onClick={() => setIsExpanded(false)}
                className="w-full mt-3 text-xs py-1 transition-all"
                style={{ color: "#9b9b9b" }}
              >
                ↑ Collapse
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

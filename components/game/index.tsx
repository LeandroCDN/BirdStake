"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import Image from "next/image";
import StakingCard from "@/components/StakingCard";
import {
  getActiveStakingPools,
  StakingPool,
} from "@/components/utils/stakingContracts";
import web3Client from "@/components/utils/web3Client";

// Token addresses principales para mostrar balances
const WLD_TOKEN_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
const GEMS_TOKEN_ADDRESS = "0xAD3eE0342CB753C2B39579F9dB292A9Ae94b153E";
const USDC_TOKEN_ADDRESS = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";

export default function Game() {
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [wldBalance, setWldBalance] = useState<string>("0.00");
  const [gemsBalance, setGemsBalance] = useState<string>("0.00");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(true);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);

  // Fetch main token balances
  const fetchMainBalances = async () => {
    try {
      if (!MiniKit.user?.walletAddress) {
        console.log("No wallet address available");
        return;
      }

      setIsLoadingBalances(true);
      const [wldBal, gemsBal, usdcBal] = await Promise.all([
        web3Client.fetchERC20Balance(
          MiniKit.user.walletAddress,
          WLD_TOKEN_ADDRESS,
          18
        ),
        web3Client.fetchERC20Balance(
          MiniKit.user.walletAddress,
          GEMS_TOKEN_ADDRESS,
          18
        ),
        web3Client.fetchERC20Balance(
          MiniKit.user.walletAddress,
          USDC_TOKEN_ADDRESS,
          6
        ),
      ]);

      setWldBalance(parseFloat(wldBal).toFixed(2));
      setGemsBalance(parseFloat(gemsBal).toFixed(2));
      setUsdcBalance(parseFloat(usdcBal).toFixed(2));
      setWalletAddress(MiniKit.user.walletAddress);
    } catch (error) {
      console.error("Error fetching main balances:", error);
    } finally {
      setIsLoadingBalances(false);
    }
  };

  // Load available staking pools
  useEffect(() => {
    const pools = getActiveStakingPools();
    setStakingPools(pools);
    fetchMainBalances();
  }, []);

  const handleRefreshBalances = () => {
    fetchMainBalances();
  };

  const handleStakeSuccess = () => {
    // Refresh main balances when a stake operation is successful
    setTimeout(fetchMainBalances, 3000);
  };

  // Mostrar todos los pools
  const filteredPools = stakingPools;

  return (
    <div
      className="flex flex-col w-screen h-screen"
      style={{ background: "linear-gradient(to bottom, #dbe9ff, #ffffff)" }}
    >
      {/* Header - Fijo */}
      <div className="">
        {/* Balance Section */}
        <div className="flex justify-center">
          <div className="bg-white text-black rounded-3xl px-6 py-3  w-full">
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/ICONS/WLD.webp"
                  alt="WLD Token"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className="font-bold">
                  {isLoadingBalances ? "..." : wldBalance}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💎</span>
                <span className="font-bold">
                  {isLoadingBalances ? "..." : gemsBalance}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/ICONS/USDC.webp"
                  alt="USDC Token"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span className="font-bold">
                  {isLoadingBalances ? "..." : usdcBalance}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
        {/* Hero Section */}
        <div className="relative ">
          {/* Background elements */}

          <div className="relative flex items-center flex-col ">
            {/* Bird Image */}
            <div className="flex-shrink-0">
              <Image
                src="/ICONS/BirdHero.webp"
                alt="Staking Bird"
                width={112}
                height={112}
                className="w-28 h-28 object-contain"
              />
            </div>

            {/* STAKE Text and Description */}
            <div className="flex-1">
              <p className="text-xl text-center mb-2 tracking-wider drop-shadow-lg">
                <span style={{ color: "#049de3" }}>Stake! </span>
                <span style={{ color: "black" }}>
                  your tokens and earn <br /> daily rewards passively
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Staking Pools Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPools.map((pool) => (
            <StakingCard
              key={pool.id}
              pool={pool}
              onStakeSuccess={handleStakeSuccess}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPools.length === 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="text-6xl mb-4">📭</div>
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: "#091747" }}
            >
              No Pools Available
            </h3>
            <p style={{ color: "#091747", opacity: 0.7 }}>
              No staking pools are currently available.
            </p>
          </div>
        )}
      </div>

      {/* Footer text */}
      {filteredPools.length > 0 && (
        <div className="flex justify-center py-4">
          <p className="text-sm text-center text-gray-500">
            The APR/Rewards displayed is the total reward, shared between all
            stakers.
          </p>
        </div>
      )}
    </div>
  );
}

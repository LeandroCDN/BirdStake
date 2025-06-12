"use client";
import web3Client from "@/components/utils/web3Client";
import chickenFarmClient from "@/components/utils/worldClient";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import Button from "../Button/index";
import Image from "next/image";

import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http, defineChain } from "viem";

// WLD Token address on WorldChain
const WLD_TOKEN_ADDRESS = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";

export default function Game() {
  const [wldBalance, setWldBalance] = useState<string>("0.00");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Function to fetch WLD balance
  const fetchWLDBalance = async () => {
    try {
      if (!MiniKit.user?.walletAddress) {
        console.log("No wallet address available");
        return;
      }

      setIsLoading(true);
      const balance = await web3Client.fetchERC20Balance(
        MiniKit.user.walletAddress,
        WLD_TOKEN_ADDRESS,
        18 // WLD has 18 decimals
      );

      setWldBalance(balance);
      setWalletAddress(MiniKit.user.walletAddress);
    } catch (error) {
      console.error("Error fetching WLD balance:", error);
      setWldBalance("Error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch balance on component mount
  useEffect(() => {
    fetchWLDBalance();
  }, []);

  // Function to refresh balance
  const handleRefreshBalance = () => {
    fetchWLDBalance();
  };

  return (
    <div className="flex flex-col w-screen h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          🎮 Game Dashboard
        </h1>

        {/* Wallet Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            💼 Wallet Information
          </h2>
          <p className="text-sm text-gray-600 break-all">
            <span className="font-medium">Address:</span>{" "}
            {walletAddress || "Not connected"}
          </p>
        </div>

        {/* WLD Balance Card */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🪙 WLD Balance</h2>
              <div className="text-3xl font-bold">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                    Loading...
                  </div>
                ) : (
                  `${wldBalance} WLD`
                )}
              </div>
            </div>
            <button
              onClick={handleRefreshBalance}
              disabled={isLoading}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 rounded-lg p-3 transition-all duration-200 hover:scale-105"
            >
              <div className={`text-2xl ${isLoading ? "animate-spin" : ""}`}>
                🔄
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 flex-1">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🎯 Game Content
        </h2>
        <div className="text-center text-gray-600">
          <p className="text-lg mb-4">Welcome to the game!</p>
          <p>Your WLD balance is displayed above.</p>
          <p className="text-sm mt-4 text-gray-500">
            More game features coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import Game from "../game";
import Image from "next/image";

export function SignIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      // You can show a message to the user that the wallet is not installed.
      alert("Worldcoin Wallet is not installed.");
      return;
    }

    setIsConnecting(true);

    try {
      const nonce = crypto.randomUUID().replace(/-/g, "");
      await MiniKit.commandsAsync.walletAuth({
        nonce: nonce,
        requestId: "0",
        expirationTime: new Date(new Date().getTime() + 300 * 1000),
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
        statement:
          "Welcome to BirdStaking! Connect your wallet to start your adventure.",
      });

      if (MiniKit.user?.walletAddress) {
        setIsLoggedIn(true);
        console.log("Wallet connected:", MiniKit.user.walletAddress);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      // You can show an error message to the user.
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    // This will attempt to sign in automatically when the component mounts.
    // You might want to trigger this with a user action instead.
    const timeoutIdSignIn = setTimeout(() => {
      if (!isLoggedIn) {
        signInWithWallet();
      }
    }, 100);
    return () => clearTimeout(timeoutIdSignIn);
  }, [isLoggedIn]);

  return (
    <div className="flex flex-col w-screen h-screen">
      {isLoggedIn ? (
        <Game />
      ) : (
        <div
          className="flex flex-col w-screen h-screen items-center justify-center p-4"
          style={{ background: "linear-gradient(to bottom, #dbe9ff, #ffffff)" }}
        >
          {/* Main content container */}
          <div className="flex flex-col items-center text-center max-w-xs w-full">
            {/* Bird Image */}
            <Image
              src="/ICONS/BirdIMG.webp"
              alt="Welcome Bird"
              width={160}
              height={160}
              className="w-40 h-40 object-contain mb-6"
              priority // Preload the main image
            />

            {/* Welcome Text */}
            <h1
              className="text-5xl md:text-6xl font-black mb-2 tracking-wider"
              style={{
                color: "#049de3",
                textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              BIRD STAKING
            </h1>
            <p
              className="text-lg font-medium mb-8"
              style={{ color: "#091747" }}
            >
              Your adventure begins now!
            </p>

            {/* Connect Button */}
            <button
              onClick={signInWithWallet}
              disabled={isConnecting}
              className="w-full py-4 px-6 rounded-2xl text-white text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl"
              style={{
                backgroundColor: isConnecting ? "#cccccc" : "#009444",
                cursor: isConnecting ? "not-allowed" : "pointer",
              }}
            >
              {isConnecting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                "Connect Wallet"
              )}
            </button>
            <p className="text-xs text-gray-500 mt-4">
              Connect your World App to continue.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

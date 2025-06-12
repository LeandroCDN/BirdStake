"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import Game from "../game";

export function SignIn() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const signInWithWallet = async () => {
    if (!MiniKit.isInstalled()) {
      return;
    }

    setIsConnecting(true);

    try {
      const nonce = crypto.randomUUID().replace(/-/g, "");
      const { commandPayload: generateMessageResult, finalPayload } =
        await MiniKit.commandsAsync.walletAuth({
          nonce: nonce,
          requestId: "0",
          expirationTime: new Date(new Date().getTime() + 300 * 1000),
          notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          statement:
            "Welcome to Chicken Farm! Connect your wallet to start farming.",
        });

      if (MiniKit.user?.walletAddress != null) {
        setIsLoggedIn(true);
      }
      console.log("Wallet connected:", MiniKit.user?.walletAddress);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const timeoutIdSigIn = setTimeout(() => {
      signInWithWallet();
    }, 0);
    return () => clearTimeout(timeoutIdSigIn);
  }, []);

  return (
    <div className="flex flex-col w-screen h-screen">
      {isLoggedIn ? (
        <Game />
      ) : (
        <div className="flex flex-col w-screen h-screen items-center justify-center p-6">
          {/* Farm Header */}

          {/* Welcome Card */}
          <div className="bg-white rounded-2xl border-4 border-yellow-400 p-8 shadow-2xl max-w-md w-full mx-4 mb-8">
            <div className="text-center">
              <div className="text-3xl mb-4">Welcome</div>
              <p className="text-gray-700 mb-6 text-lg">
                Connect your wallet to start your chicken farming adventure!
              </p>

              <button
                onClick={signInWithWallet}
                disabled={isConnecting}
                className={`w-full py-4 px-6 rounded-xl text-white text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isConnecting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                }`}
              >
                {isConnecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {} Connect Wallet{" "}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

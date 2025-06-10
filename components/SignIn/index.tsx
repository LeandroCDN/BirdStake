"use client";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import ChickenFarmGame from "../game";
import { FARM_THEME } from "../utils/config";

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
          statement: "Welcome to Chicken Farm! Connect your wallet to start farming.",
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
        <ChickenFarmGame />
      ) : (
        <div 
          className="flex flex-col w-screen h-screen items-center justify-center p-6"
          style={{
            backgroundImage: FARM_THEME.COLORS.BACKGROUND,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Farm Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {FARM_THEME.EMOJIS.CHICKEN}{FARM_THEME.EMOJIS.EGG}
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              Chicken Farm
            </h1>
            <p className="text-lg text-white drop-shadow-md">
              Compound, Pocket and Hire Daily!
            </p>
          </div>

          {/* Welcome Card */}
          <div className="bg-white rounded-2xl border-4 border-yellow-400 p-8 shadow-2xl max-w-md w-full mx-4 mb-8">
            <div className="text-center">
              <div className="text-3xl mb-4">
                {FARM_THEME.EMOJIS.GRAIN} Welcome to the Farm! {FARM_THEME.EMOJIS.GRAIN}
              </div>
              <p className="text-gray-700 mb-6 text-lg">
                Connect your wallet to start your chicken farming adventure!
              </p>
              
              <button 
                onClick={signInWithWallet}
                disabled={isConnecting}
                className={`w-full py-4 px-6 rounded-xl text-white text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  isConnecting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {isConnecting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {FARM_THEME.EMOJIS.COIN} Connect Wallet {FARM_THEME.EMOJIS.COIN}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Farm Features */}
          <div className="grid grid-cols-3 gap-4 max-w-md w-full mx-4">
            <div className="bg-white/90 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-2">{FARM_THEME.EMOJIS.EGG}</div>
              <p className="text-sm font-semibold text-gray-700">Buy Eggs</p>
            </div>
            <div className="bg-white/90 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-2">{FARM_THEME.EMOJIS.HATCH}</div>
              <p className="text-sm font-semibold text-gray-700">Hatch Chickens</p>
            </div>
            <div className="bg-white/90 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl mb-2">{FARM_THEME.EMOJIS.MONEY}</div>
              <p className="text-sm font-semibold text-gray-700">Earn Rewards</p>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-6 text-center">
            <p className="text-white/80 text-sm">
              {FARM_THEME.EMOJIS.GRAIN} Powered by WorldChain {FARM_THEME.EMOJIS.GRAIN}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import web3Client from "@/components/utils/web3Client";
import chickenFarmClient from "@/components/utils/worldClient";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import Button from "../Button/index";
import Image from "next/image";
import ResultModal from "./resultModal";
import SendTransactionModal from "./sendTransactionModal";
import InfoModal from "./infoModal";
import WelcomeModal from "./welcomeModal";
import { ethers } from "ethers";
import TxLimitModal from "./txLimitModal";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http, defineChain } from "viem";
import { CONTRACTS, GAME_CONFIG, MESSAGES, FARM_THEME, formatLargeNumber } from "../utils/config";

interface UserData {
  miners: string;
  claimedEggs: string;
  eggsSinceLastHatch: string;
  lastHatch: number;
  referral: string;
}

export default function ChickenFarmGame() {
  // State management
  const [userBalance, setUserBalance] = useState("0");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [contractBalance, setContractBalance] = useState("0");
  const [selectedAmount, setSelectedAmount] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRefreshingData, setIsRefreshingData] = useState(false);
  
  // Transaction states
  const [isTransacting, setIsTransacting] = useState(false);
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<"buy" | "hatch" | "sell" | null>(null);
  
  // Modal states
  const [resultModal, setResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultTitle, setResultTitle] = useState("");
  const [txLimitModal, setTxLimitModal] = useState(false);
  const [infoModal, setInfoModal] = useState(false);
  const [welcomeModal, setWelcomeModal] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [language, setLanguage] = useState<"en" | "es">("es");
  const [referralAddress, setReferralAddress] = useState("");
  const [showReferralInput, setShowReferralInput] = useState(false);
  
  const [transactionId, setTransactionId] = useState<string>("");

  // Translations
  const content = {
    en: {
      tokenBalance: "Token Balance:",
      chickens: "Chickens",
      eggs: "Eggs",
      buyEggs: "Buy Eggs (Feed Your Farm)",
      youWillGet: "✨ You'll get:",
      gallinas: "chickens",
      referrer: "Referrer",
      addReferrer: "Add Referrer",
      referrerPlaceholder: "Enter referrer address...",
      hatch: "🐣 HATCH",
      sell: "💰 SELL",
      notInitialized: "⚠️ Farm not initialized yet. Please wait for the farm to be ready.",
      howToPlay: "📖 How to Play?",
      welcome: "🌾 WLD Welcome to Chicken Farm 🌾 ",
      dailyAction: "Compound, Pocket and Hire Daily!",
      loading: {
        buying: "Buying...",
        hatching: "Hatching...",
        selling: "Selling..."
      },
      transaction: {
        preparing: "Preparing transaction...",
        mining: "Transaction mining...",
        preparingBuy: "Preparing egg purchase...",
        miningBuy: "Mining egg purchase...",
        preparingHatch: "Preparing egg hatching...",
        miningHatch: "Mining egg hatching...",
        preparingSell: "Preparing egg sale...",
        miningSell: "Mining egg sale..."
      },
      results: {
        purchased: "Eggs Purchased!",
        purchasedMsg: "Successfully bought eggs with {amount} tokens!",
        hatched: "Eggs Hatched!",
        hatchedMsg: "Your eggs have been hatched into chickens!",
        sold: "Eggs Sold!",
        soldMsg: "Successfully sold your eggs for {amount} tokens!"
      }
    },
    es: {
      tokenBalance: "Balance de Tokens:",
      chickens: "Gallinas",
      eggs: "Huevos",
      buyEggs: "Comprar Huevos (Alimenta tu Granja)",
      youWillGet: "✨ Obtendrás:",
      gallinas: "gallinas",
      referrer: "Referido",
      addReferrer: "Agregar Referido",
      referrerPlaceholder: "Ingresa dirección de referido...",
      hatch: "🐣 ECLOSIONAR",
      sell: "💰 VENDER",
      notInitialized: "⚠️ Granja no inicializada aún. Por favor espera a que la granja esté lista.",
      howToPlay: "📖 ¿Cómo Jugar?",
      welcome: "🌾 WLD Bienvenido a Chicken Farm 🌾 WLD",
      dailyAction: "¡Compuesta, Guarda y Contrata Diariamente!",
      loading: {
        buying: "Comprando...",
        hatching: "Eclosionando...",
        selling: "Vendiendo..."
      },
      transaction: {
        preparing: "Preparando transacción...",
        mining: "Transacción minándose...",
        preparingBuy: "Preparando compra de huevos...",
        miningBuy: "Minando compra de huevos...",
        preparingHatch: "Preparando eclosión...",
        miningHatch: "Minando eclosión...",
        preparingSell: "Preparando venta...",
        miningSell: "Minando venta..."
      },
      results: {
        purchased: "¡Huevos Comprados!",
        purchasedMsg: "¡Compraste exitosamente huevos con {amount} tokens!",
        hatched: "¡Huevos Eclosionados!",
        hatchedMsg: "¡Tus huevos han sido eclosionados en gallinas!",
        sold: "¡Huevos Vendidos!",
        soldMsg: "¡Vendiste exitosamente tus huevos por {amount} tokens!"
      }
    }
  };

  const t = content[language];

  // Worldchain setup
  const worldchain = defineChain({
    id: 1,
    name: "Worldcoin",
    network: "worldcoin",
    nativeCurrency: {
      decimals: 18,
      name: "Worldcoin",
      symbol: "WLD",
    },
    rpcUrls: {
      default: { http: ["https://worldchain-mainnet.g.alchemy.com/public"] },
      public: { http: ["https://worldchain-mainnet.g.alchemy.com/public"] },
    },
  });

  const client = createPublicClient({
    chain: worldchain,
    transport: http(),
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError,
    error,
  } = useWaitForTransactionReceipt({
    client: client,
    appConfig: {
      app_id: process.env.NEXT_PUBLIC_APP_ID || "app_6622fe76eb91d00ba658675617881a6d",
    },
    transactionId: transactionId,
  });

  // Use centralized number formatting
  const formatNumber = formatLargeNumber;

  // Calculate total eggs (claimed + since last hatch)
  const getTotalEggs = (): string => {
    if (!userData) return "0";
    const claimed = parseFloat(userData.claimedEggs);
    const sinceHatch = parseFloat(userData.eggsSinceLastHatch);
    return (claimed + sinceHatch).toString();
  };

  // Calculate estimated values
  const [estimatedSellValue, setEstimatedSellValue] = useState("0");
  const [estimatedHatchValue, setEstimatedHatchValue] = useState("0");
  const [purchaseEstimate, setPurchaseEstimate] = useState({ eggs: "0", chickens: "0" });

  useEffect(() => {
    const calculateValues = async () => {
      if (!userData) return;
      try {
        const totalEggs = getTotalEggs();
        if (parseFloat(totalEggs) > 0) {
          // Calculate sell value
          const sellValue = await web3Client.calculateEggSell(totalEggs, CONTRACTS.CHICKEN_FARM);
          setEstimatedSellValue(sellValue);
          
          // Calculate hatch value (new chickens)
          const hatchValue = await web3Client.calculateHatchValue(totalEggs, CONTRACTS.CHICKEN_FARM);
          setEstimatedHatchValue(hatchValue);
        } else {
          setEstimatedSellValue("0");
          setEstimatedHatchValue("0");
        }
      } catch (error) {
        console.error("Error calculating values:", error);
      }
    };
    calculateValues();
  }, [userData]);

  // Calculate purchase estimates
  useEffect(() => {
    const calculatePurchase = async () => {
      if (!isInitialized) return;
      try {
        const estimate = await web3Client.calculatePurchaseResults(selectedAmount.toString(), CONTRACTS.CHICKEN_FARM);
        setPurchaseEstimate(estimate);
      } catch (error) {
        console.error("Error calculating purchase estimate:", error);
      }
    };
    calculatePurchase();
  }, [selectedAmount, isInitialized]);

  // Show welcome modal for new users (only once)
  useEffect(() => {
    if (userData && userData.miners === "0" && !welcomeModal && !isTransacting && !hasSeenWelcome) {
      setWelcomeModal(true);
    }
  }, [userData, welcomeModal, isTransacting, hasSeenWelcome]);

  // Fetch all user data
  const fetchUserData = async () => {
    if (!MiniKit.user?.walletAddress) {
      return;
    }

    try {
      setIsRefreshingData(true);
      
      // Get user balance of payment token
      const balance = await web3Client.fetchERC20Balance(
        MiniKit.user?.walletAddress,
        CONTRACTS.PAYMENT_TOKEN
      );
      setUserBalance(balance);

      // Get user farm data
      const farmData = await web3Client.getUserData(
        MiniKit.user?.walletAddress,
        CONTRACTS.CHICKEN_FARM
      );
      setUserData(farmData);

      // Get contract info
      const initialized = await web3Client.isInitialized(CONTRACTS.CHICKEN_FARM);
      setIsInitialized(initialized);

      const contractBal = await web3Client.getContractBalance(CONTRACTS.CHICKEN_FARM);
      setContractBalance(contractBal);

    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsRefreshingData(false);
    }
  };

  // Transaction handlers
  const handleBuyEggs = async (customReferral?: string) => {
    if (!MiniKit.user?.walletAddress) return;
    
    try {
      setIsTransacting(true);
      setSendingTransaction(true);
      setTransactionType("buy");

      // Use custom referral, or user's referral input, or default
      const finalReferral = customReferral || 
        (referralAddress && /^0x[a-fA-F0-9]{40}$/.test(referralAddress) ? referralAddress : "") ||
        GAME_CONFIG.DEFAULT_REFERRAL;

      const response = await chickenFarmClient.buyEggs(
        CONTRACTS.CHICKEN_FARM,
        selectedAmount,
        CONTRACTS.PAYMENT_TOKEN,
        finalReferral
      );

      if (response?.finalPayload?.status === "success") {
        // Add delay to show the transaction submission modal briefly
        setTimeout(() => {
          setTransactionId((response.finalPayload as any).transaction_id);
          setSendingTransaction(false); // Stop showing "sending" and start showing "mining"
        }, 500);
      } else {
        handleTransactionError(response);
      }
    } catch (error) {
      console.error("Error buying eggs:", error);
      setIsTransacting(false);
      setSendingTransaction(false);
    }
  };



  const handleHatchEggs = async () => {
    if (!MiniKit.user?.walletAddress) return;
    
    try {
      setIsTransacting(true);
      setSendingTransaction(true);
      setTransactionType("hatch");

      const response = await chickenFarmClient.hatchEggs(
        CONTRACTS.CHICKEN_FARM,
        GAME_CONFIG.DEFAULT_REFERRAL
      );

      if (response?.finalPayload?.status === "success") {
        // Add delay to show the transaction submission modal briefly
        setTimeout(() => {
          setTransactionId((response.finalPayload as any).transaction_id);
          setSendingTransaction(false); // Stop showing "sending" and start showing "mining"
        }, 500);
      } else {
        handleTransactionError(response);
      }
    } catch (error) {
      console.error("Error hatching eggs:", error);
      setIsTransacting(false);
      setSendingTransaction(false);
    }
  };

  const handleSellEggs = async () => {
    if (!MiniKit.user?.walletAddress) return;
    
    try {
      setIsTransacting(true);
      setSendingTransaction(true);
      setTransactionType("sell");

      const response = await chickenFarmClient.sellEggs(CONTRACTS.CHICKEN_FARM);

      if (response?.finalPayload?.status === "success") {
        // Add delay to show the transaction submission modal briefly
        setTimeout(() => {
          setTransactionId((response.finalPayload as any).transaction_id);
          setSendingTransaction(false); // Stop showing "sending" and start showing "mining"
        }, 500);
      } else {
        handleTransactionError(response);
      }
    } catch (error) {
      console.error("Error selling eggs:", error);
      setIsTransacting(false);
      setSendingTransaction(false);
    }
  };

  const handleTransactionError = (response: any) => {
    setIsTransacting(false);
    setSendingTransaction(false);
    
    if (response?.finalPayload?.error_code === "daily_tx_limit_reached") {
      setTxLimitModal(true);
    }
  };

  // Monitor transaction states
  useEffect(() => {
    if (isConfirmed) {
      console.log("Transaction confirmed successfully!");
      setIsTransacting(false);
      setSendingTransaction(false);
      
      // Show success modal based on transaction type
      if (transactionType === "buy") {
        setResultTitle(t.results.purchased);
        setResultMessage(t.results.purchasedMsg.replace("{amount}", selectedAmount.toString()));
      } else if (transactionType === "hatch") {
        setResultTitle(t.results.hatched);
        setResultMessage(t.results.hatchedMsg);
      } else if (transactionType === "sell") {
        setResultTitle(t.results.sold);
        setResultMessage(t.results.soldMsg.replace("{amount}", formatNumber(estimatedSellValue)));
      }
      
      setResultModal(true);
      
      // Refresh data immediately and then again after a delay to ensure blockchain state is updated
      fetchUserData();
      setTimeout(() => {
        fetchUserData();
      }, 2000);
    }
    
    if (isError) {
      console.error("Transaction error:", error);
      setIsTransacting(false);
      setSendingTransaction(false);
    }
  }, [isConfirmed, isError, transactionType, selectedAmount, estimatedSellValue, t]);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
  }, []);

  // Auto-refresh data every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransacting) { // Only refresh if not in the middle of a transaction
        console.log("Auto-refreshing farm data...");
        fetchUserData();
      }
    }, 5000); // 1 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [isTransacting]);  return (
    <div 
      className="p-3 flex flex-col justify-between min-h-screen"
      style={{
        backgroundImage: `linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header - Farm Status */}
      <div className="flex flex-col gap-3">
        {/* Token Balance */}
        <div className={`bg-gradient-to-r ${FARM_THEME.COLORS.TOKEN_BALANCE} rounded-lg border-2 border-white p-3 shadow-lg`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div className="flex gap-1 mr-2">
                <button
                  onClick={() => setLanguage("en")}
                  className={`text-sm transition-all ${language === "en" ? "scale-110" : "opacity-60 hover:opacity-100"}`}
                >
                  🇺🇸
                </button>
                <button
                  onClick={() => setLanguage("es")}
                  className={`text-sm transition-all ${language === "es" ? "scale-110" : "opacity-60 hover:opacity-100"}`}
                >
                  🇪🇸
                </button>
              </div>
              {/* Data refresh indicator */}
              {isRefreshingData && (
                <div className="animate-spin text-sm ">.</div>
              )}
              <span className="text-xl">{FARM_THEME.EMOJIS.COIN}</span>
              <span className="text-base font-bold">{t.tokenBalance}</span>
            </div>
            <span className="text-lg font-bold">{formatNumber(userBalance)} {FARM_THEME.EMOJIS.GRAIN}</span>
          </div>
        </div>

        {/* Farm Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg border-2 border-white p-2 shadow-lg">
            <div className="text-center text-white">
              <div className="text-xl mb-1">🐔</div>
              <div className="text-xs">{t.chickens}</div>
              <div className="text-base font-bold">{formatNumber(userData?.miners || "0")}</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-lg border-2 border-white p-2 shadow-lg">
            <div className="text-center text-white">
              <div className="text-xl mb-1">🥚</div>
              <div className="text-xs">{t.eggs}</div>
              <div className="text-base font-bold">{formatNumber(getTotalEggs())}</div>
            </div>
          </div>
        </div>

        {/* Chicken Cost Info */}
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg border-2 border-white p-2 shadow-lg">
          <div className="text-center text-white">
            <div className="text-xs">🐣 {language === "es" ? "Costo por Gallina" : "Cost per Chicken"}</div>
            <div className="text-base font-bold">1 🐔 = 2.6M 🥚</div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="space-y-3">
        {/* Buy Eggs Section */}
        <div className="bg-white rounded-lg border-2 border-gray-300 p-3 shadow-lg">
          <h3 className="text-base font-bold text-center mb-2 text-gray-800">
            🛒 {t.buyEggs}
          </h3>
          
          {/* Amount Selection */}
          <div className="grid grid-cols-4 gap-1 mb-2">
            {GAME_CONFIG.AMOUNT_OPTIONS.map((amount) => (
              <Button
                key={amount}
                onClick={() => setSelectedAmount(amount)}
                variant="primary"
                size="sm"
                isSelected={selectedAmount === amount}
                disabled={isTransacting}
              >
                {amount} 🌾 WLD
              </Button>
            ))}
          </div>

          {/* Purchase Estimate */}
          {parseFloat(purchaseEstimate.chickens) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
              <p className="text-green-700 text-xs text-center font-medium">
                {t.youWillGet} {formatNumber(purchaseEstimate.chickens)} 🐔 {t.gallinas}
              </p>
            </div>
          )}

          {/* Referrer Section */}
          <div className="mb-2">
            <button
              onClick={() => setShowReferralInput(!showReferralInput)}
              className="flex items-center justify-between w-full text-xs text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isTransacting}
            >
              <span>👥 {t.addReferrer}</span>
              <span className={`transform transition-transform ${showReferralInput ? 'rotate-180' : ''}`}>
                ⬇️
              </span>
            </button>
            
            {showReferralInput && (
              <div className="mt-2">
                                 <input
                   type="text"
                   value={referralAddress}
                   onChange={(e) => setReferralAddress(e.target.value)}
                   placeholder={t.referrerPlaceholder}
                   className={`w-full px-3 py-2 text-base border rounded-lg focus:outline-none focus:ring-2 ${
                     referralAddress === "" || /^0x[a-fA-F0-9]{40}$/.test(referralAddress)
                       ? "border-gray-300 focus:ring-green-500" 
                       : "border-red-400 focus:ring-red-500"
                   }`}
                   style={{ fontSize: '16px' }}
                   disabled={isTransacting}
                 />
                {referralAddress !== "" && !/^0x[a-fA-F0-9]{40}$/.test(referralAddress) && (
                  <p className="text-red-500 text-xs mt-1">
                    {language === "es" ? "Dirección inválida" : "Invalid address"}
                  </p>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={() => handleBuyEggs()}
            variant="primary"
            size="md"
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={isTransacting || !isInitialized}
          >
            {isTransacting && transactionType === "buy" 
              ? t.loading.buying 
              : `Buy ${selectedAmount} 🌾 WLD`
            }
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <Button
              onClick={handleHatchEggs}
              variant="primary"
              size="md"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isTransacting || !userData || parseFloat(getTotalEggs()) === 0 || parseFloat(estimatedHatchValue) < 1}
            >
              {isTransacting && transactionType === "hatch" 
                ? t.loading.hatching 
                : t.hatch
              }
            </Button>
            {/* Hatch result preview */}
            {parseFloat(estimatedHatchValue) >= 1 && (
              <div className="bg-orange-100 border border-orange-200 rounded-lg p-1 mt-1">
                <p className="text-orange-700 text-xs text-center font-medium">
                  +{formatNumber(estimatedHatchValue)} 🐔
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <Button
              onClick={handleSellEggs}
              variant="primary"
              size="md"
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isTransacting || !userData || parseFloat(getTotalEggs()) === 0}
            >
              {isTransacting && transactionType === "sell" 
                ? t.loading.selling 
                : t.sell
              }
            </Button>
            {/* Sell result preview */}
            {parseFloat(estimatedSellValue) > 0 && (
              <div className="bg-red-100 border border-red-200 rounded-lg p-1 mt-1">
                <p className="text-red-700 text-xs text-center font-medium">
                  +{formatNumber(estimatedSellValue)} 🌾 WLD
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contract Status */}
        {!isInitialized && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            {t.notInitialized}
          </div>
        )}
      </div>

      {/* Modals */}
      {resultModal && (
        <ResultModal
          title={resultTitle}
          resultMessage={resultMessage}
          result={true}
          onClose={() => {
            setResultModal(false);
            // Refresh data again when modal closes to ensure UI is in sync
            setTimeout(() => {
              fetchUserData();
            }, 500);
          }}
        />
      )}

      {isTransacting && (
        <SendTransactionModal
          resultMessage={
            sendingTransaction 
              ? (transactionType === "buy" ? t.transaction.preparingBuy :
                 transactionType === "hatch" ? t.transaction.preparingHatch :
                 transactionType === "sell" ? t.transaction.preparingSell :
                 t.transaction.preparing)
              : (transactionType === "buy" ? t.transaction.miningBuy :
                 transactionType === "hatch" ? t.transaction.miningHatch :
                 transactionType === "sell" ? t.transaction.miningSell :
                 t.transaction.mining)
          }
          onClose={() => {
            setIsTransacting(false);
            setSendingTransaction(false);
          }}
        />
      )}

      {txLimitModal && (
        <TxLimitModal
          title="Daily Farm Limit Reached"
          resultMessage="You've reached your daily transaction limit. Your chickens need rest!"
          onClose={() => setTxLimitModal(false)}
        />
      )}

      {infoModal && (
        <InfoModal
          onClose={() => setInfoModal(false)}
          contractBalance={contractBalance}
        />
      )}

      {welcomeModal && (
        <WelcomeModal
          onClose={() => {
            setWelcomeModal(false);
            setHasSeenWelcome(true);
          }}
        />
      )}

      {/* How to Play Button */}
      <div className="text-center mb-2">
        <button
          onClick={() => setInfoModal(true)}
          className="bg-gray-200/30 backdrop-blur-sm hover:bg-gray-200/50 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all transform hover:scale-105 border border-gray-300/50"
        >
          {t.howToPlay}
        </button>
      </div>

      {/* Farm Footer */}
      <div className="text-center text-gray-600 text-xs">
        {t.welcome}<br/>
        {t.dailyAction}
      </div>
    </div>
  );
}

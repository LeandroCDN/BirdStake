"use client";
import web3Client from "@/components/utils/web3Client";
import worldClient from "@/components/utils/worldClient";
import settleBet from "@/components/utils/settleBet";
import { MiniKit } from "@worldcoin/minikit-js";
import { use, useEffect, useState } from "react";
import Button from "./../Button/index";
import ABIFlip from "@/public/ABIS/Flip.json";
import Link from "next/link";
import Image from "next/image";
import ResultModal from "./resultModal";
import SendTxModal from "./sendTransactionModal";
import { ethers } from "ethers";
import TxLimitModal from "./txLimitModal";
import PointsInfo from "./pointsInfo";
import PushModal from "./pushModal";
import { useWaitForTransactionReceipt } from "@worldcoin/minikit-react";
import { createPublicClient, http, defineChain } from "viem";

type Move = "LEFT" | "RIGHT";
const MOVES: Move[] = ["LEFT", "RIGHT"];
type WLD = 0.15 | 0.3 | 0.5 | 1 | 2 | 5 | 10 | 20;
type USDC = 0.25 | 0.5 | 1 | 2 | 5 | 10 | 20 | 50;
type GEMS = 5 | 10 | 20 | 50 | 100 | 200 | 500 | 1000;
type ORO = 1 | 8 | 16 | 32 | 64 | 128 | 248 | 512;
type DNA = 1 | 8 | 16 | 32 | 64 | 128 | 248 | 512;
const WLD_AMOUNT_OPTIONS: WLD[] = [0.15, 0.3, 0.5, 1, 2, 5, 10, 20];
const USDC_AMOUNT_OPTIONS: USDC[] = [0.25, 0.5, 1, 2, 5, 10, 20, 50];
const GEMS_AMOUNT_OPTIONS: GEMS[] = [5, 10, 20, 50, 100, 200, 500, 1000];
const ORO_AMOUNT_OPTIONS: ORO[] = [1, 8, 16, 32, 64, 128, 248, 512];
const DNA_AMOUNT_OPTIONS: DNA[] = [1, 8, 16, 32, 64, 128, 248, 512];

interface Bet {
  choice: boolean; // uint40
  winResult: boolean; // uint40
  placeBlockNumber: BigInt; // uint176
  amount: bigint; // uint128
  winAmount: bigint; // uint128
  player: string; // address
  token: string; // address
  isSettled: boolean; // bool
}
interface Goals {
  totalGoals: string;
  userGoal: string;
}

export default function Game() {
  const usdc = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";
  const wld = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
  const gems = "0xAD3eE0342CB753C2B39579F9dB292A9Ae94b153E";
  const oro = "0xcd1E32B86953D79a6AC58e813D2EA7a1790cAb63";
  const dna = "0xED49fE44fD4249A09843C2Ba4bba7e50BECa7113";
  const game = "0x6A84107E72d20E310598f5346abF7e92280CF672";
  const [points, setPoints] = useState("0");
  const [wldBalance, setWldBalance] = useState("0");
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [gemsBalance, setGemsBalance] = useState(0);
  const [oroBalance, setOroBalance] = useState(0);
  const [dnaBalance, setDNABalance] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState<
    WLD | USDC | GEMS | ORO | DNA
  >(1);
  const [selectedMove, setSelectedMove] = useState<Move | null>();
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [selectedToken, setSelectedToken] = useState(wld);
  const [pendingBets, setPendingBets] = useState(0);
  const [isPlaying, setisPlaying] = useState(false);
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [settleBetResult, setSettleBetResult] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [txLimitModal, setTxLimitModal] = useState(false);
  const [pointsModal, setPointsModal] = useState(false);
  const [pushModal, setPushModal] = useState(false);
  const [bg, setBg] = useState(0);
  const [transactionId, setTransactionId] = useState<string>("");

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
      app_id:
        process.env.NEXT_PUBLIC_APP_ID ||
        "app_6622fe76eb91d00ba658675617881a6d",
    },
    transactionId: transactionId,
  });

  // Add effect to monitor transaction states
  useEffect(() => {
    if (isConfirming) {
      console.log("Transaction is being confirmed...");
    }
    if (isConfirmed) {
      console.log("Transaction confirmed successfully!");
      endGame();
    }
    if (isError) {
      console.error("Transaction error:", error);
    }
  }, [isConfirming, isConfirmed, isError, error]);

  const bgImages = [
    "/bgs/0.webp",
    "/bgs/1.webp",
    "/bgs/2.webp",
    "/bgs/3.webp",
    "/bgs/4.webp",
    "/bgs/5.webp",
    "/bgs/6.webp",
  ];

  const fetchUserBalances = async () => {
    if (MiniKit.walletAddress == null) {
      return;
    }

    const wldBalanceOF = await web3Client.fetchERC20Balance(
      MiniKit.walletAddress,
      wld
    );
    setWldBalance(wldBalanceOF);

    const usdcBalanceOF = await web3Client.fetchERC20Balance(
      MiniKit.walletAddress,
      usdc,
      6
    );
    setUsdcBalance(parseFloat(usdcBalanceOF));

    const gemsBalanceOF = await web3Client.fetchERC20Balance(
      MiniKit.walletAddress,
      gems
    );
    setGemsBalance(parseFloat(gemsBalanceOF));

    const oroBalanceOF = await web3Client.fetchERC20Balance(
      MiniKit.walletAddress,
      oro
    );
    setOroBalance(parseFloat(oroBalanceOF));

    const dnaBalanceOF = await web3Client.fetchERC20Balance(
      MiniKit.walletAddress,
      dna
    );
    setDNABalance(parseFloat(dnaBalanceOF));
    const flipContract = await web3Client.getContract(game, ABIFlip);
    const totalGoals = await flipContract.totalGlobalGoals();
    const totalUserGames = await flipContract.playerInfo(MiniKit.walletAddress);
    const pendingId = await flipContract.pendingIdsPerPlayer(
      MiniKit.walletAddress
    );
    setPendingBets(pendingId);
    if (pendingId != 0) {
      const pendingIdUserChoice = await flipContract.bets(
        Number(pendingId) - 1
      );
      setSelectedMove(MOVES[Number(pendingIdUserChoice.choice)]);
      setSelectedAmount(0.15);
    }

    setGoals({
      totalGoals: totalGoals.toString(),
      userGoal: totalUserGames[1].toString(),
    });
  };

  const handleShoot = async () => {
    try {
      setisPlaying(true);
      setSendingTransaction(true);
      const response = await worldClient.sendTransaction(
        game,
        selectedMove === "LEFT" ? 0 : 1,
        selectedAmount,
        selectedToken
      );

      if (response?.finalPayload?.status === "success") {
        setTransactionId(response.finalPayload.transaction_id);
        // The hook will automatically handle the confirmation state
        // We don't need to manually check isConfirmed here
        // callBack();
      } else {
        const e = new Error(response.finalPayload?.error_code);
        console.log("ERROR", e);
        if (response?.finalPayload?.status === "error") {
          setisPlaying(false);
          setSendingTransaction(false);
        }
        if (e.message == "daily_tx_limit_reached") {
          setTxLimitModal(true);
          console.log("Daily tx limit reached", true);
        }
      }
    } catch (e) {
      setisPlaying(false);
      setSendingTransaction(false);
      console.log(e);
    }
  };

  const callBack = () => {
    const checkPendingId = async () => {
      if (MiniKit.walletAddress == null) {
        return;
      }
      const flipContract = await web3Client.getContract(game, ABIFlip);

      const pendingId = await flipContract.pendingIdsPerPlayer(
        MiniKit.walletAddress
      );

      if (pendingId != 0) {
        setSettleBetResult(true);
        console.log("Launching game with pendingId:", pendingId);
        await endGame();
      } else {
        setTimeout(checkPendingId, 1000); // Vuelve a consultar en 1 segundo
      }
    };
    checkPendingId();
  };

  async function endGame() {
    if (MiniKit.walletAddress == null) {
      return;
    }
    setisPlaying(true);
    setSendingTransaction(false);
    setSettleBetResult(true);
    const { data, pendingId, error } = await settleBet.settleBet(
      game,
      MiniKit.walletAddress
    );

    // console.log("Transaction :", data);

    const flipContract = await web3Client.getContract(game, ABIFlip);
    const betData = await flipContract.bets(Number(pendingId) - 1);
    // console.log(betData);
    const formattedBet: Bet = {
      choice: betData.choice,
      winResult: Boolean(betData.winResult),
      placeBlockNumber: BigInt(betData.placeBlockNumber),
      amount: BigInt(betData.amount),
      winAmount: BigInt(betData.winAmount),
      player: betData.player,
      token: betData.token,
      isSettled: betData.isSettled,
    };
    // if (formattedBet.isSettled === true) {
    setSettleBetResult(false);
    setCurrentBet(formattedBet);
    console.log("formattedBet.winResult", formattedBet.winResult);
    console.log("formattedBet.choice", formattedBet.choice);

    if (formattedBet.isSettled === true) {
      if (formattedBet.winResult === true) {
        if (formattedBet.choice) {
          setBg(6);
        } else {
          console.log("win 5 ");
          setBg(5);
        }
      } else {
        if (formattedBet.choice) {
          setBg(4);
        } else {
          setBg(3);
        }
      }
      setisPlaying(false);
      setTimeout(() => {
        setResultModal(true);
      }, 700);
    } else {
      setSettleBetResult(false);
      setisPlaying(false);
      resetInitialState();
    }

    console.log("Current bet:", formattedBet);
  }

  function resetInitialState() {
    setSelectedMove(null);
    setSelectedAmount(1);
    setCurrentBet(null);
    setBg(0);
    fetchUserBalances();
  }

  useEffect(() => {
    if (!resultModal) {
      resetInitialState();
    }
  }, [resultModal]);

  useEffect(() => {
    fetchUserBalances();
    bgImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  const SocialIcons = (
    <div className="flex flex-col gap-2 absolute top-[5.5em]">
      <Link
        href="https://t.me/BirdGamesWLD"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/svg/telegram.svg"
          alt="Telegram"
          width={50}
          height={50}
          className="max-w-[90%] border-[1.7px] bg-white rounded-md border-white"
        />
      </Link>
      <Link
        href="https://x.com/BirdGamesWLD"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/svg/twitter-logo-2.svg"
          alt="Twitter"
          width={50}
          height={50}
          className="max-w-[90%] border-[1.7px] rounded-md border-white"
        />
      </Link>
    </div>
  );

  const Games = (
    <div className="flex flex-col gap-2 absolute top-[5.5em] right-2">
      <Link
        href="worldapp://mini-app?app_id=app_f4226f1aa308e6ef7ccca995888d155e"
        target=""
        rel=""
      >
        <Image
          src="/games/crash.webp"
          alt="crash"
          width={50}
          height={50}
          className="max-w-[90%] border-[1.7px] bg-white rounded-md border-black"
        />
      </Link>
      <Link
        href="worldapp://mini-app?app_id=app_b67c3e1ab1f44f3533b234a53d5a156d"
        target="_blank"
        rel=""
      >
        <Image
          src="/games/box.webp"
          alt="king"
          width={50}
          height={50}
          className="max-w-[90%] border-[1.7px] rounded-md border-black"
        />
      </Link>
      <Link
        href="worldapp://mini-app?app_id=app_22aab9b718f16cb32505b5df816f65f5"
        target="_blank"
        rel=""
      >
        <Image
          src="/games/king.png"
          alt="king"
          width={50}
          height={50}
          className="max-w-[90%] border-[1.7px] rounded-md border-black"
        />
      </Link>
    </div>
  );

  const TokenSelector = () => {
    const tokens = [
      { symbol: "WLD", address: wld, balance: wldBalance },
      { symbol: "USDC", address: usdc, balance: usdcBalance },
      { symbol: "GEMS", address: gems, balance: gemsBalance },
      // { symbol: "ORO", address: oro, balance: oroBalance },
      // { symbol: "DNA", address: dna, balance: dnaBalance },
    ];

    return (
      <select
        className="p-1 text-sm rounded-lg border-[1.7px] border-white bg-[#2775ca] text-white"
        onChange={(e) => setSelectedToken(e.target.value)}
        value={selectedToken}
        disabled={isPlaying || pendingBets != 0}
      >
        {tokens.map((token) => (
          <option key={token.symbol} value={token.address}>
            {token.symbol} - {token.balance}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div
      className="p-4 flex flex-col justify-between"
      style={{
        backgroundImage: `url(${bgImages[bg]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100svh",
        width: "100%",
        opacity: 1,
      }}
    >
      <div className="flex flex-row justify-between w-full">
        <div className="flex gap-4 min-w-[57%] bg-gradient-to-b from-[#ffe500] to-[#ff8a00] rounded-lg border-white border-[1.7px] mr-2">
          <div className="flex flex-row justify-between items-center text-white w-full px-2 py-1">
            <img src="/ball.webp" alt="WLD Logo" className="w-8 h-8" />
            <p className="text-3xl"> {goals?.totalGoals}</p>
            <div className="flex flex-col text-base">
              <p className="p-0 mb-[-5px]"> Total</p>
              <p className="p-0 mt-[-5px]"> Goals</p>
            </div>
          </div>
        </div>
        <section className="flex flex-row items-center justify-between px-2 gap-2 bg-gradient-to-b from-[#ffe500] to-[#ff8a00] border-white border-[1.7px] rounded-lg max-w-[40%] min-w-[40%] w-[40%]">
          <p className="text-white text-xl text-right">
            {selectedToken === wld
              ? "WLD " + wldBalance
              : selectedToken === usdc
              ? "USDC " + usdcBalance
              : selectedToken === gems
              ? "GEMS " + gemsBalance
              : selectedToken === oro
              ? "ORO " + oroBalance
              : "DNA " + dnaBalance}
          </p>
        </section>
      </div>
      {SocialIcons}
      {Games}
      <div className="space-y-1">
        <TokenSelector />
        <div className="grid grid-cols-2 gap-2">
          {MOVES.map((move) => (
            <Button
              key={move}
              onClick={() => {
                if (selectedMove !== move) {
                  setSelectedMove(move);
                  setBg(move === "LEFT" ? 1 : 2); // Cambia el fondo según el movimiento
                }
              }}
              variant="primary"
              isSelected={selectedMove === move}
              size="md"
              disabled={isPlaying || pendingBets != 0}
            >
              {move}
            </Button>
          ))}
        </div>
        <div className="grid gap-2 overflow-hidden">
          <div className="grid grid-cols-4 gap-1">
            {(selectedToken === wld
              ? WLD_AMOUNT_OPTIONS
              : selectedToken === usdc
              ? USDC_AMOUNT_OPTIONS
              : selectedToken === gems
              ? GEMS_AMOUNT_OPTIONS
              : selectedToken === oro
              ? ORO_AMOUNT_OPTIONS
              : DNA_AMOUNT_OPTIONS
            ).map((amount) => (
              <Button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                }}
                variant="primary"
                size="sm"
                isSelected={selectedAmount === amount}
                disabled={isPlaying || pendingBets != 0}
              >
                {amount}{" "}
                {selectedToken === wld
                  ? "WLD"
                  : selectedToken === usdc
                  ? "USDC"
                  : selectedToken === gems
                  ? "GEMS"
                  : selectedToken === oro
                  ? "ORO"
                  : "DNA"}
              </Button>
            ))}
          </div>
        </div>
        <Button
          onClick={pendingBets == 0 ? handleShoot : endGame}
          variant="play"
          size={pendingBets == 0 ? "lg" : "md"}
          className="w-full"
          disabled={isPlaying}
        >
          {pendingBets == 0
            ? isPlaying
              ? "PLAYING..."
              : "SHOOT!"
            : "RESUME GAME"}
        </Button>
      </div>
      {resultModal && (
        <ResultModal
          title={currentBet?.winResult ? "GOOOAL!" : "MISSED!"}
          resultMessage={
            currentBet?.winResult
              ? selectedToken === usdc
                ? "YOU WON " +
                  `${Number(currentBet?.winAmount || 0) / 10 ** 6}` +
                  " USDC"
                : "YOU WON " +
                  `${ethers.formatEther(currentBet?.winAmount || 0)}` +
                  `${
                    selectedToken === wld
                      ? " $WLD"
                      : selectedToken === gems
                      ? " $GEMS"
                      : selectedToken === oro
                      ? " $ORO"
                      : ""
                  }`
              : "YOUR SHOT WAS SAVED"
          }
          result={currentBet?.winResult ?? false}
          onClose={() => setResultModal(false)} // Solo cierra el modal
        />
      )}
      {isPlaying && (
        <SendTxModal
          resultMessage={
            sendingTransaction ? `ROLLING UP SOCKS...` : `STARTING RUN-UP...`
          }
          onClose={() => setSendingTransaction(false)}
        />
      )}
      {txLimitModal && (
        <TxLimitModal
          title="Transaction Limit Reached"
          resultMessage="You have reached your daily transaction limit. Please try again later."
          onClose={() => setTxLimitModal(false)}
        />
      )}
      {pointsModal && (
        <PointsInfo
          title="$Bird Points"
          points={Number(points)}
          resultMessage="Play on Birdgames to get more points!"
          onClose={() => setPointsModal(false)}
        />
      )}

      {pushModal && (
        <PushModal
          title="El titulo"
          points={Number(points)}
          resultMessage="Un mensaje random"
          onClose={() => setPushModal(false)}
        />
      )}
    </div>
  );
}

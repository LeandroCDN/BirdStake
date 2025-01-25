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

type Move = "LEFT" | "RIGHT";
const MOVES: Move[] = ["LEFT", "RIGHT"];
type WLD = 0.15 | 0.3 | 0.5 | 1 | 2 | 5;
type USDC = 0.25 | 0.5 | 1 | 2 | 4 | 10;
const WLD_AMOUNT_OPTIONS: WLD[] = [0.15, 0.3, 0.5, 1, 2, 5];
const USDC_AMOUNT_OPTIONS: USDC[] = [0.25, 0.5, 1, 2, 4, 10];

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
  const game = "0x6A84107E72d20E310598f5346abF7e92280CF672";
  const [points, setPoints] = useState("0");
  const [wldBalance, setWldBalance] = useState("0");
  const [selectedAmount, setSelectedAmount] = useState<WLD | USDC>(1);
  const [selectedMove, setSelectedMove] = useState<Move | null>();
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [selectedToken, setSelectedToken] = useState(wld);
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [pendingBets, setPendingBets] = useState(0);
  const [isPlaying, setisPlaying] = useState(false);
  const [sendingTransaction, setSendingTransaction] = useState(false);
  const [settleBetResult, setSettleBetResult] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [txLimitModal, setTxLimitModal] = useState(false);
  const [pointsModal, setPointsModal] = useState(false);
  const [bg, setBg] = useState(0);
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

    const points = await web3Client.getTotalPoints(
      MiniKit.walletAddress,
      "0xE58742A05C93877c8eDe03B9192c6A08E78B70cE"
    );
    setPoints(points.toString());
    console.log("User Points:", points);

    const wldBalanceOF = await web3Client.fetchERC20Balance(
      MiniKit.walletAddress,
      wld
    );

    setWldBalance(wldBalanceOF);
    await setUsdcBalance(
      parseFloat(
        await web3Client.fetchERC20Balance(MiniKit.walletAddress, usdc, 6)
      )
    );
    const flipContract = await web3Client.getContract(game, ABIFlip);
    const totalGoals = await flipContract.totalGlobalGoals();
    const totalUserGames = await flipContract.playerInfo(MiniKit.walletAddress);
    const pendingId = await flipContract.pendingIdsPerPlayer(
      MiniKit.walletAddress
    );
    setPendingBets(pendingId);

    setGoals({
      totalGoals: totalGoals.toString(),
      userGoal: totalUserGames[1].toString(),
    });
  };

  const handleShoot = async () => {
    // check daily_transaction_limit

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
        endGame();
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

  function endGame() {
    setTimeout(async () => {
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
      if (formattedBet.isSettled === true) {
        setSettleBetResult(false);
        setCurrentBet(formattedBet);
        console.log("formattedBet.winResult", formattedBet.winResult);
        console.log("formattedBet.choice", formattedBet.choice);
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
    }, 3000);
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
      <div className="flex flex-row justify-between  w-full ">
        <div className="flex gap-4  min-w-[57%] bg-gradient-to-b from-[#ffe500] to-[#ff8a00] rounded-lg border-white border-[1.7px] mr-2">
          <div className="flex flex-row justify-between items-center text-white w-full px-2 py-1">
            <img src="/ball.webp" alt="WLD Logo" className="w-8 h-8" />
            <p className="text-3xl"> {goals?.totalGoals}</p>
            <div className="flex flex-col text-base ">
              <p className="p-0 mb-[-5px]"> Total</p>
              <p className="p-0 mt-[-5px]"> Goals</p>
            </div>
          </div>
        </div>
        <section className="flex flex-row items-center justify-between px-2 gap-2 bg-gradient-to-b from-[#ffe500] to-[#ff8a00] border-white border-[1.7px] rounded-lg max-w-[40%] min-w-[40%] w-[40%]">
          <p className="text-white text-xl">
            {selectedToken === wld ? "$WLD" : "$USDC"}
          </p>
          <p className="text-white text-xl text-right">
            {selectedToken === wld ? wldBalance : usdcBalance}
          </p>
        </section>
      </div>
      {SocialIcons}
      <div className="space-y-1">
        <div className="flex justify-center items-center">
          <button
            onClick={() => setPointsModal(true)}
            className="text-black/50 text-sm flex items-center space-x-1"
          >
            <span>{points.toString()}</span>
            <img
              src="/info.svg"
              alt="info icon text-black/50"
              className="w-4 h-4"
            />
          </button>
        </div>
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
              disabled={isPlaying}
            >
              {move}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr,3fr] gap-2 overflow-hidden">
          <div
            className={`relative text-white flex flex-col bg-bl ${
              selectedToken === wld ? "bg-[#2775ca]" : "bg-[#3b3b3b]"
            } border-[1.7px] border-white rounded-lg p-2 font-medium transition-all duration-200 ease-in-out overflow-hidden`}
          >
            <button
              onClick={() => {
                selectedToken == wld
                  ? setSelectedToken(usdc)
                  : setSelectedToken(wld);
              }}
              className="relative text-base text-center z-20"
              disabled={isPlaying}
            >
              {selectedToken === wld ? "PLAY IN USDC" : "PLAY IN WLD"}
            </button>
            {/* Imagen posicionada */}
          </div>
          {selectedToken === wld ? (
            <div className="grid grid-cols-3 gap-2">
              {WLD_AMOUNT_OPTIONS.map((wldd) => (
                <Button
                  key={wldd}
                  onClick={() => {
                    setSelectedAmount(wldd);
                  }}
                  variant="primary"
                  size="sm"
                  isSelected={selectedAmount === wldd}
                  disabled={isPlaying}
                >
                  {wldd} {selectedToken === wld ? "WLD" : "USDC"}
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {USDC_AMOUNT_OPTIONS.map((wldd) => (
                <Button
                  key={wldd}
                  onClick={() => {
                    setSelectedAmount(wldd);
                  }}
                  variant="primary"
                  size="sm"
                  isSelected={selectedAmount === wldd}
                  disabled={isPlaying}
                >
                  {wldd} {selectedToken === wld ? "WLD" : "USDC"}
                </Button>
              ))}
            </div>
          )}
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
              ? selectedToken === wld
                ? "YOU WON " +
                  `${ethers.formatEther(currentBet?.winAmount || 0)}`
                : "YOU WON " + `${Number(currentBet?.winAmount || 0) / 10 ** 6}`
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
    </div>
  );
}

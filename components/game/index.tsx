"use client";
import web3Client from "@/components/utils/web3Client";
import worldClient from "@/components/utils/worldClient";
import settleBet from "@/components/utils/settleBet";
import { MiniKit } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import Button from "./../Button/index";
type Move = "LEFT" | "RIGHT";
const MOVES: Move[] = ["LEFT", "RIGHT"];
type WLD = 0.1 | 0.2 | 0.5 | 1 | 2 | 5;
const WLD_AMOUNT_OPTIONS: WLD[] = [0.1, 0.2, 0.5, 1, 2, 5];

interface Bet {
  choice: BigInt; // uint40
  winResult: boolean; // uint40
  placeBlockNumber: BigInt; // uint176
  amount: bigint; // uint128
  winAmount: bigint; // uint128
  player: string; // address
  token: string; // address
  isSettled: boolean; // bool
}

export default function Game() {
  const [usdcBalance, setUsdcBalance] = useState(0);
  const [wldBalance, setWldBalance] = useState("0");
  const [selectedAmountWLD, setSelectedAmountWLD] = useState<WLD>(2);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [selectedMove, setSelectedMove] = useState<Move | null>("LEFT");
  const [bg, setBg] = useState(0);
  const bgImages = ["/bgs/0.webp", "/bgs/1.webp", "/bgs/2.webp", "/bgs/3.webp"];

  const usdc = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";
  const wld = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";
  const game = "0x8CfECbdC92D77fFB6704235b15FeBeF3dd047266";

  const fetchUserBalances = async () => {
    console.log("El user:", MiniKit.user);
    if (MiniKit.walletAddress == null) {
      return;
    }
    const wldBalanceOF = await web3Client.fetchERC20Balance(
      MiniKit.walletAddress,
      wld
    );
    console.log(wldBalanceOF);
    setWldBalance(wldBalanceOF);
    await setUsdcBalance(
      parseFloat(
        await web3Client.fetchERC20Balance(MiniKit.walletAddress, usdc, 6)
      )
    );

    console.log("WLD Balance:", wldBalance);
  };

  const handleShoot = async () => {
    const response = await worldClient.sendTransaction(
      game,
      (selectedMove === "LEFT" ? true : false).toString(),
      100,
      wld
    );
    if (response?.finalPayload?.status === "success") {
      endGame();
    }
  };

  function endGame() {
    setTimeout(async () => {
      if (MiniKit.walletAddress == null) {
        return;
      }
      const r = await settleBet.settleBet(game, MiniKit.walletAddress);
      console.log("Transaction :", r);

      const flipContract = await web3Client.getContract(
        game,
        MiniKit.walletAddress
      );
      const betData = await flipContract.bets(MiniKit.walletAddress);
      const formattedBet: Bet = {
        choice: BigInt(betData.choice),
        winResult: Boolean(betData.winResult),
        placeBlockNumber: BigInt(betData.placeBlockNumber),
        amount: BigInt(betData.amount),
        winAmount: BigInt(betData.winAmount),
        player: betData.player,
        token: betData.token,
        isSettled: betData.isSettled,
      };
      setCurrentBet(formattedBet);
      console.log("Current bet:", formattedBet);
    }, 3000);
  }

  useEffect(() => {
    fetchUserBalances();
    bgImages.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return (
    <div
      className="p-4 flex flex-col items-center justify-between"
      style={{
        backgroundImage: `url(${bgImages[bg]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100svh",
        width: "100%",
        opacity: 1,
      }}
    >
      <div className="flex flex-row justify-between  w-full mb-8 text-3xl">
        <div className="flex gap-4 p-2 min-w-[59%] bg-gradient-to-b from-[#ffe500] to-[#ff8a00] rounded-lg border-white border-[1.7px] mr-2">
          <div className="flex flex-row gap-4 text-white">
            <img src="/ball.webp" alt="WLD Logo" className="w-8 h-8" />
            <p> 63.332</p>
            <div className="flex flex-col text-sm">
              <p> Total</p>
              <p> Goals</p>
            </div>
          </div>
        </div>
        <section className="flex flex-row items-center gap-4 bg-gradient-to-b from-[#ffe500] to-[#ff8a00] border-white border-[1.7px] rounded-lg p-2 w-[50%]">
          <img src="/wldlogo.webp" alt="WLD Logo" className="w-8 h-8" />
          <div className="text-white">{wldBalance}</div>
        </section>
      </div>

      <div className="space-y-3 ">
        <div className="grid grid-cols-2 gap-2">
          {MOVES.map((move) => (
            <Button
              key={move}
              onClick={() => {
                setSelectedMove(selectedMove === "LEFT" ? "RIGHT" : "LEFT");
                setBg(selectedMove === "LEFT" ? 2 : 1);
              }}
              variant="primary"
              isSelected={selectedMove === move}
              size="md"
            >
              {move}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {WLD_AMOUNT_OPTIONS.map((wld) => (
            <Button
              key={wld}
              onClick={() => setSelectedAmountWLD(wld)}
              variant="primary"
              size="sm"
              isSelected={selectedAmountWLD === wld}
            >
              {wld} WLD
            </Button>
          ))}
        </div>
        <Button
          onClick={handleShoot}
          variant="play"
          size="lg"
          className="w-full"
        >
          PLAY!
        </Button>
      </div>
    </div>
  );
}

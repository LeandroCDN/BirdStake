import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import ABI from "@/public/ABIS/Flip.json";

export async function POST(_request: NextRequest) {
  const pendingId = _request.nextUrl.searchParams.get("pendingId");

  const wallets = [
    process.env.SIGNER_WALLET_1,
    process.env.SIGNER_WALLET_2
  ]
  const index = Number(pendingId) % 2
  console.log("STARTING BET");
  const signerPrivateKey = wallets[index];
  const RPC = process.env.NEXT_PUBLIC_RPC_URL;
  const provider = new ethers.JsonRpcProvider(RPC);
  if (!signerPrivateKey) {
    throw new Error("SIGNER_WALLET_PRIVATE_KEY environment variable is not set");
  }
  const signer = new ethers.Wallet(signerPrivateKey, provider);
  const ganeContract = "0x6A84107E72d20E310598f5346abF7e92280CF672";
  if (!ganeContract) {
    throw new Error("NEXT_PUBLIC_MINE_ADDRESS environment variable is not set");
  }

  const randomNumber = Math.floor(Math.random() * 100000);
  const contract = new ethers.Contract(ganeContract, ABI, signer);

  const maxRetries = 2;
  let attempts = 0;
  let transactionSuccessful = false;

  while (attempts <= maxRetries && !transactionSuccessful) {
    attempts++;
    console.log(`Attempt ${attempts} to settle bet...`);
    try {
      const resultBet = await contract._settleBet(pendingId, randomNumber, {
        gasPrice: 600000,
        gasLimit: 200000,
      });

      console.log("Transaction sent. Waiting for receipt...");

      const receipt = await resultBet.wait();
      if (receipt.status === 1) {
        console.log("Transaction mined successfully:", receipt);
        transactionSuccessful = true;

        return NextResponse.json({
          message: "Transaction succeeded",
          receipt,
        });
      } else {
        console.error("Transaction failed:", receipt);
        if (attempts > maxRetries) {
          return NextResponse.json({
            error: "Transaction failed after maximum retries",
          });
        }
      }
    } catch (error) {
      console.error(`Error on attempt ${attempts}:`, error);
      if (attempts > maxRetries) {
        return NextResponse.json({
          error: "Transaction failed after maximum retries",
          details: (error as any).message,
        });
      }
    }
  }

  console.log("Bet is not over");
  return NextResponse.json({ error: "Bet is not over" });
}

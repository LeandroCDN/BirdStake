import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import ABI from "@/public/ABIS/Flip.json";

export async function POST(_request: NextRequest) {
  const pendingId = _request.nextUrl.searchParams.get("pendingId");

  const wallets = [
    process.env.SIGNER_WALLET_1,
    process.env.SIGNER_WALLET_2,
    process.env.SIGNER_WALLET_3,
    process.env.SIGNER_WALLET_4
  ]
  const index = Number(pendingId) % 4
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
  let attempts = 2;
  let transactionSuccessful = false;

  attempts++;
  console.log(`Attempt ${attempts} to settle bet... ${pendingId}`);
  const feeData = await provider.getFeeData()

  try {
    const resultBet = await contract._settleBet(pendingId, randomNumber, {
      gasPrice: 800000,
      gasLimit: 200000, // Keep your gas limit
    });

    console.log("Transaction sent. Waiting for receipt...");

    return NextResponse.json({
      message: "Transaction sent",
      txHash: resultBet.hash, // Devuelves el hash de la transacción
    });
  } catch (error) {
    console.error(`Error on attempt ${attempts} if ${pendingId}:`, error);
    console.error(`feeData :`, feeData);
    if (attempts > maxRetries) {
      return NextResponse.json({
        error: "Transaction failed after maximum retries",
        details: (error as any).message,
      });
    }
  }

  console.log("Bet is not over");
  return NextResponse.json({ error: "Bet is not over" });
}

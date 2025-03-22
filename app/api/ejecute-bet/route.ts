import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import ABI from "@/public/ABIS/Flip.json";

export async function POST(_request: NextRequest) {
  const pendingId = _request.nextUrl.searchParams.get("pendingId");

  const wallets = [
    process.env.SIGNER_WALLET_1,
    process.env.SIGNER_WALLET_1,
    process.env.SIGNER_WALLET_3,
    process.env.SIGNER_WALLET_4
  ];
  const index = Number(pendingId) % 4;
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
  const nonce = await provider.getTransactionCount(signer.address, "latest");
  console.log("Current nonce:", nonce);


  const randomNumber = Math.floor(Math.random() * 100000);
  const contract = new ethers.Contract(ganeContract, ABI, signer);

  const maxRetries = 3;
  let attempts = 0;
  let transactionSuccessful = false;

  while (attempts < maxRetries && !transactionSuccessful) {

    console.log(`Attempt ${attempts} to settle bet... ${pendingId}`);
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice ?? BigInt(0);
    const gasPriceFixed = [gasPrice, gasPrice + BigInt(100000), gasPrice + BigInt(600000)];
    try {
      const resultBet = await contract._settleBet(pendingId, randomNumber, {
        gasPrice: gasPriceFixed[attempts], // Aumentamos el gasPrice para evitar el error
        gasLimit: 300000,
      });

      console.log("Transaction sent. Waiting for receipt...");
      transactionSuccessful = true;

      return NextResponse.json({
        message: "Transaction sent",
        txHash: resultBet.hash,
      });
    } catch (error: any) {
      console.error(`Error on attempt ${attempts} for ${pendingId}:`, error);

      if (error.code === 'REPLACEMENT_UNDERPRICED' || error.info?.error?.message === 'replacement transaction underpriced') {
        console.log("Retrying with higher gas price...");
        continue; // Reintenta con un gasPrice más alto
      }

      if (attempts >= maxRetries) {
        return NextResponse.json({
          error: "Transaction failed after maximum retries",
          details: error.message,
        });
      }
    }
    attempts++;
  }

  console.log("Bet is not over");
  return NextResponse.json({ error: "Bet is not over" });
}
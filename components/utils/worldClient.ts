import { ethers } from "ethers";
import { createPermitTransfer, createTransferDetails } from '@/components/utils/permitTransfer';
import { MiniAppSendTransactionPayload, MiniKit, SendTransactionInput } from "@worldcoin/minikit-js";
const ABI = [
    {
        inputs: [
            {
                internalType: "uint256",
                name: "multiplierChoice",
                type: "uint256",
            },
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "address",
                                name: "token",
                                type: "address",
                            },
                            {
                                internalType: "uint256",
                                name: "amount",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct ISignatureTransfer.TokenPermissions",
                        name: "permitted",
                        type: "tuple",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "deadline",
                        type: "uint256",
                    },
                ],
                internalType: "struct ISignatureTransfer.PermitTransferFrom",
                name: "permit",
                type: "tuple",
            },
            {
                components: [
                    {
                        internalType: "address",
                        name: "to",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "requestedAmount",
                        type: "uint256",
                    },
                ],
                internalType: "struct ISignatureTransfer.SignatureTransferDetails",
                name: "transferDetails",
                type: "tuple",
            },
            {
                internalType: "bytes",
                name: "signature",
                type: "bytes",
            },
        ],
        name: "placeBet",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
// Configuración inicial
const RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public";

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Clase para manejar la lógica Web3
class worldClient {

    async sendTransaction(gameAddress: string, side: boolean, tokenAmount: number, token: string,): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {
        const { permitTransfer, permitTransferArgsForm } = createPermitTransfer(token, tokenAmount);
        const { transferDetails, transferDetailsArgsForm } = createTransferDetails(token, tokenAmount, gameAddress);

        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: gameAddress, // Contract address
                    abi: ABI, // ABI of the function
                    functionName: "placeBet", // Name of the function
                    args: [
                        side,
                        permitTransferArgsForm,
                        transferDetailsArgsForm,
                        "PERMIT2_SIGNATURE_PLACEHOLDER_0",
                    ],
                },
            ],
            permit2: [
                {
                    ...permitTransfer,
                    spender: gameAddress,
                },
            ],
        });
        console.log('worldClient.sendTransaction response:', response);


        return response;
    }

}

// Instancia exportada para reutilizar
const web3Client = new worldClient();

export default web3Client;
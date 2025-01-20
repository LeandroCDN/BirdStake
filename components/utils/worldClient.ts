import { ethers } from "ethers";
import { createPermitTransfer, createTransferDetails } from '@/components/utils/permitTransfer';
import { MiniAppSendTransactionPayload, MiniKit, SendTransactionInput } from "@worldcoin/minikit-js";
const ABI = [
    {
        inputs: [
            {
                "internalType": "uint8",
                "name": "side",
                "type": "uint8"
            },
            {
                "components": [
                    {
                        "components": [
                            {
                                "internalType": "address",
                                "name": "token",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "amount",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct ISignatureTransfer.TokenPermissions",
                        "name": "permitted",
                        "type": "tuple"
                    },
                    {
                        "internalType": "uint256",
                        "name": "nonce",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "deadline",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISignatureTransfer.PermitTransferFrom",
                "name": "permit",
                "type": "tuple"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "to",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "requestedAmount",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ISignatureTransfer.SignatureTransferDetails",
                "name": "transferDetails",
                "type": "tuple"
            },
            {
                "internalType": "bytes",
                "name": "signature",
                "type": "bytes"
            }
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

    async sendTransaction(gameAddress: string, side: number, tokenAmount: number, token: string,): Promise<{
        commandPayload: SendTransactionInput | null;
        finalPayload: MiniAppSendTransactionPayload;
    }> {

        const { permitTransfer, permitTransferArgsForm } = createPermitTransfer(token, tokenAmount.toString());
        const { transferDetails, transferDetailsArgsForm } = createTransferDetails(token, tokenAmount.toString(), gameAddress);
        console.log("sendTransaction side:", side.toString());
        const response = await MiniKit.commandsAsync.sendTransaction({
            transaction: [
                {
                    address: gameAddress, // Contract address
                    abi: ABI, // ABI of the function
                    functionName: "placeBet", // Name of the function
                    args: [
                        side.toString(),
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
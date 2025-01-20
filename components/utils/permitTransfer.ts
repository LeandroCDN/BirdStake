import { ethers } from "ethers";

// Define las interfaces para las estructuras
interface PermitTransfer {
  permitted: {
    token: string;
    amount: string;
  };
  nonce: string;
  deadline: string;
}

interface TransferDetails {
  to: string;
  requestedAmount: string;
}

const wldAddress = "0x2cFc85d8E48F8EAB294be644d9E25C3030863003";


export const createPermitTransfer = (
  token: string,
  tokenAmount: string,
): {
  permitTransfer: PermitTransfer;
  permitTransferArgsForm: [string[], string, string];
} => {
  const deadline = Math.floor((Date.now() + 30 * 60 * 1000) / 1000).toString();
  const permitTransfer: PermitTransfer = {
    permitted: {
      token: token.toString(),
      amount:
        token === wldAddress
          ? ethers.parseEther(tokenAmount.toString()).toString()
          : (Number(tokenAmount) * 10 ** 6).toString(),
    },
    nonce: Date.now().toString(),
    deadline,
  };

  const permitTransferArgsForm: [string[], string, string] = [
    [permitTransfer.permitted.token, permitTransfer.permitted.amount],
    permitTransfer.nonce,
    permitTransfer.deadline,
  ];

  return { permitTransfer, permitTransferArgsForm };
};

export const createTransferDetails = (
  token: string,
  tokenAmount: string,
  gameAddress: string
): {
  transferDetails: TransferDetails;
  transferDetailsArgsForm: [string, string];
} => {

  const transferDetails: TransferDetails = {
    to: gameAddress,
    requestedAmount:
      token === wldAddress
        ? ethers.parseEther(tokenAmount.toString()).toString()
        : (Number(tokenAmount) * 10 ** 6).toString(),
  };

  const transferDetailsArgsForm: [string, string] = [
    transferDetails.to,
    transferDetails.requestedAmount,
  ];

  return { transferDetails, transferDetailsArgsForm };
};

/**
 * HOW TO USE
 * 
```
import { createPermitTransfer, createTransferDetails } from '@/lib/permitTransfer';

const token = '0x123...'; // Dirección del token
const tokenAmount = 100;
const wldAddress = '0x456...'; // Dirección especial
const CRASHAddress = '0x789...'; // Dirección de destino
const deadline = '1711111111'; // Timestamp de deadline

const { permitTransfer, permitTransferArgsForm } = createPermitTransfer(token, tokenAmount, wldAddress, deadline);
const { transferDetails, transferDetailsArgsForm } = createTransferDetails(token, tokenAmount, wldAddress, CRASHAddress);

console.log(permitTransfer, permitTransferArgsForm);
console.log(transferDetails, transferDetailsArgsForm);
```
 * 
 */

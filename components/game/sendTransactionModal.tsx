import React from "react";
import Button from "../Button";
import Image from "next/image";
interface ModalProps {
  resultMessage: string;
  onClose: () => void; // Cambiado el nombre a `onClose` para mayor claridad
}

const SendTxModal: React.FC<ModalProps> = ({ resultMessage, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Image
        src="/ball.webp"
        alt="WorldCoin"
        width={275}
        height={275}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 grayscale-0 animate-pulse"
      />

      <div
        className={`bg-black/70 text-white rounded-lg p-4 max-w-md w-full border-2  border-[#ff8a00] z-50 `}
      >
        <div className=" space-y-2 text-center flex flex-row">
          <p className={`text-4xl text-white `}>{resultMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default SendTxModal;

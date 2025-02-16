import Link from "next/link";
import React from "react";

interface ModalProps {
  title: string;
  resultMessage: string;
  points: number;
  onClose: () => void; // Cambiado el nombre a `onClose` para mayor claridad
}

const PushModal: React.FC<ModalProps> = ({
  title,
  points,
  resultMessage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black/50 rounded-lg shadow-lg p-6 w-96 flex flex-col items-center border-2 border-[#ff8a00]">
        <h2 className="text-2xl text-center font-bold text-[#ffe500] mb-2">
          &quot;KING&quot; IS NOW LIVE!
        </h2>
        <p className="text-white text-xl text-center  ">Try our new game and</p>
        <p className="text-white text-xl mb-4"> win hundreds of $WLD </p>

        <div className="flex flex-row gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 bg-opacity-55 text-white px-4 py-2 rounded "
          >
            Close
          </button>
          <Link
            href="https://worldcoin.org/mini-app?app_id=app_22aab9b718f16cb32505b5df816f65f5"
            target="_blank"
            className="bg-yellow-500 text-white px-6 py-2 rounded text-xl"
          >
            TRY IT NOW!
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PushModal;

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
        <h2 className="text-4xl text-center font-bold text-[#ffe500] mb-2">
          GET FREE $WLD
        </h2>
        <p className="text-white text-xl ">20 $WLD giveaway this week! </p>
        <p className="text-white text-xl mb-4">Follow us to participate </p>

        <div className="flex flex-row gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded "
          >
            Close
          </button>
          <Link
            href="https://t.me/BirdGamesWLD"
            target="_blank"
            className="bg-blue-400 text-white px-4 py-2 rounded "
          >
            Telegram
          </Link>
          <Link
            href="https://x.com/BirdGamesWLD"
            target="_blank"
            className="bg-black text-white px-4 py-2 rounded "
          >
            TWITTER
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PushModal;

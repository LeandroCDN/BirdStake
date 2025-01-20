import React from "react";
import Button from "../Button";

interface ModalProps {
  title: string;
  result: boolean;
  resultMessage: string;
  onClose: () => void; // Cambiado el nombre a `onClose` para mayor claridad
}

const ResultModal: React.FC<ModalProps> = ({
  title,
  result,
  resultMessage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-15 flex items-center justify-center z-50 p-4">
      {/* Caja principal con borde dinámico */}
      <div
        className={`bg-black/70 text-white rounded-lg p-6 max-w-md w-full border-2  border-[#ff8a00] `}
      >
        {/* Título con color dinámico */}
        <h2 className={`text-center text-6xl font-bold text-[#ffe500]`}>
          {title}
        </h2>
        <div className="mt-4 space-y-2 text-center">
          {/* Mensaje final con color dinámico */}
          <p className={`text-4xl text-white `}>{resultMessage}</p>
        </div>

        <div className="mt-6 text-center">
          <Button onClick={onClose} variant="play" size="md" className="w-full">
            SHOOT AGAIN!
          </Button>
          {/* <button
            onClick={onClose}
            className="py-2 px-6 bg-transparent text-[#00ff00] font-bold rounded-md border border-[#00ff00] hover:bg-[#00ff00] hover:text-black transition"
          >
            SHOOT AGAIN!
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;

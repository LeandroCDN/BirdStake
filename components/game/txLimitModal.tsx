import React from "react";

interface ModalProps {
  title: string;
  resultMessage: string;
  onClose: () => void; // Cambiado el nombre a `onClose` para mayor claridad
}

const TxLimitModal: React.FC<ModalProps> = ({
  title,
  resultMessage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-black/50 rounded-lg shadow-lg p-6 w-96 flex flex-col items-center border-2 border-[#ff8a00]">
        <h2 className="text-4xl text-center  mb-4">{title}</h2>
        <p className="text-gray-300 text-center mb-6">{resultMessage}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TxLimitModal;

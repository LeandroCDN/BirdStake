import React from "react";

interface TxLimitModalProps {
  title: string;
  text: string;
  open: boolean;
  onClose: () => void;
}

export default function TxLimitModal({
  title,
  text,
  open,
  onClose,
}: TxLimitModalProps) {
  if (!open) return null; // Si no está abierto, no renderiza nada.

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{text}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}

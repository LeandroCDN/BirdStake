import React from "react";
import Button from "../Button";

interface ModalProps {
  title: string;
  result: boolean;
  resultMessage: string;
  onClose: () => void;
}

const ResultModal: React.FC<ModalProps> = ({
  title,
  result,
  resultMessage,
  onClose,
}) => {
  // Emojis based on result type
  const getSuccessEmoji = () => {
    if (title.includes("Purchase") || title.includes("Bought")) return "🛒";
    if (title.includes("Hatch")) return "🐣";
    if (title.includes("Sold") || title.includes("Sell")) return "💰";
    return "✅";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Farm background animation */}
      <div className="fixed top-1/4 left-1/2 transform -translate-x-1/2 text-6xl animate-bounce opacity-20">
        {result ? "🎉" : "😔"}
      </div>

      {/* Modal content */}
      <div className="bg-gradient-to-br from-green-400 to-yellow-300 text-white rounded-xl p-6 max-w-sm w-full border-4 border-white shadow-2xl relative">
        {/* Farm decorations */}
        <div className="absolute -top-2 -left-2 text-2xl animate-pulse">🌻</div>
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🌾</div>
        <div className="absolute -bottom-2 -left-2 text-2xl">🥚</div>
        <div className="absolute -bottom-2 -right-2 text-2xl animate-pulse">🐔</div>

        {/* Content */}
        <div className="space-y-4 text-center relative z-10">
          {/* Success icon */}
          <div className="text-4xl mb-2 animate-bounce">
            {result ? getSuccessEmoji() : "😞"}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white drop-shadow-lg">
            {title}
          </h2>

          {/* Message */}
          <div className="space-y-2">
            <p className="text-base text-white/90 leading-relaxed">
              {resultMessage}
            </p>
          </div>

          {/* Action button */}
          <div className="mt-6">
            <Button 
              onClick={onClose} 
              variant="primary" 
              size="md" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              🐔 CONTINUE FARMING!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;

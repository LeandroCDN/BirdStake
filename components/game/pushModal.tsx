import Link from "next/link";
import React from "react";

interface ModalProps {
  title: string;
  resultMessage: string;
  points: number;
  onClose: () => void;
}

const PushModal: React.FC<ModalProps> = ({
  title,
  points,
  resultMessage,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 backdrop-blur-sm">
      {/* Farm background animation */}
      <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 text-8xl animate-pulse opacity-30">
        🏡
      </div>

      <div className="bg-gradient-to-br from-green-500 via-yellow-400 to-orange-400 rounded-xl shadow-2xl p-8 w-96 flex flex-col items-center border-4 border-white relative">
        {/* Farm decorations */}
        <div className="absolute -top-3 -left-3 text-4xl animate-bounce">🐔</div>
        <div className="absolute -top-3 -right-3 text-4xl animate-pulse">🌾</div>
        <div className="absolute -bottom-3 -left-3 text-4xl">🥚</div>
        <div className="absolute -bottom-3 -right-3 text-4xl animate-bounce">🐣</div>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Header icon */}
          <div className="text-5xl mb-4 animate-bounce">🎊</div>
          
          <h2 className="text-2xl text-center font-bold text-white mb-3 drop-shadow-lg">
            🐔 Amazing Chicken Farm! 🌾
          </h2>
          
          <div className="space-y-2 mb-6">
            <p className="text-white text-lg font-medium">
              Discover our latest farm adventure
            </p>
            <p className="text-white/90 text-base">
              Join thousands of farmers and claim your rewards!
            </p>
            
            {/* Points display if available */}
            {points > 0 && (
              <div className="bg-white/20 rounded-lg p-3 mt-4">
                <p className="text-yellow-100 font-bold">
                  🌟 Earn up to {points} Farm Points! 🌟
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-row gap-3">
            <button
              onClick={onClose}
              className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-all"
            >
              🚪 Maybe Later
            </button>
            <Link
              href="https://worldcoin.org/mini-app?app_id=app_6622fe76eb91d00ba658675617881a6d"
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 START FARMING!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushModal;

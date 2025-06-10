import React from "react";

interface ModalProps {
  resultMessage: string;
  onClose: () => void;
}

const SendTxModal: React.FC<ModalProps> = ({ resultMessage, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {/* Farm background animation */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
        <div className="text-8xl animate-pulse">🐔</div>
      </div>

      {/* Modal content */}
      <div className="bg-gradient-to-br from-green-500 to-yellow-400 text-white rounded-xl p-6 max-w-sm w-full border-4 border-white shadow-2xl z-50 relative">
        {/* Farm decorations */}
        <div className="absolute -top-3 -left-3 text-3xl animate-spin">🌻</div>
        <div className="absolute -top-3 -right-3 text-3xl animate-bounce">🌾</div>
        <div className="absolute -bottom-3 -left-3 text-3xl">🥚</div>
        <div className="absolute -bottom-3 -right-3 text-3xl animate-pulse">🐣</div>

        {/* Content */}
        <div className="space-y-3 text-center relative z-10">
          <div className="text-2xl mb-2">🏡</div>
          <h3 className="text-lg font-bold text-white">Chicken Farm</h3>
          <p className="text-base text-white/90 leading-relaxed">
            {resultMessage}
          </p>
          
          {/* Loading indicator */}
          <div className="flex justify-center items-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendTxModal;

import React, { useState } from "react";
import Button from "../Button";

interface WelcomeModalProps {
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [language, setLanguage] = useState<"en" | "es">("es");

  const content = {
    en: {
      title: "🎉 Welcome to Chicken Farm!",
      subtitle: "Start your farming journey",
      description: "Begin your adventure and build your chicken empire. The more you invest, the more you earn!",
      startButton: "🚀 START FARMING!",
      referralTitle: "💫 Share & Earn Free Eggs!",
      referralDescription: "Share your referral link and earn free eggs when friends join your farm!",
      benefits: [
        "🥚 24/7 automatic egg production", 
        "💰 Daily returns up to 3%",
        "🎯 ROI in ~30 days",
        "🤝 Referral rewards system"
      ]
    },
    es: {
      title: "🎉 ¡Bienvenido a Chicken Farm!",
      subtitle: "Comienza tu aventura de granja",
      description: "¡Inicia tu aventura y construye tu imperio de gallinas. Mientras más inviertas, más ganas!",
      startButton: "🚀 ¡EMPEZAR A CRIAR!",
      referralTitle: "💫 ¡Comparte y Gana Huevos Gratis!",
      referralDescription: "¡Comparte tu enlace de referido y gana huevos gratis cuando tus amigos se unan a tu granja!",
      benefits: [
        "🥚 Producción automática 24/7 Permanente",
        "💰 Retornos diarios hasta 3%",
        "🎯 ROI en ~30 días",
        "🤝 Sistema de recompensas por referidos"
      ]
    }
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Enhanced Background animation */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-20">🐔</div>
        <div className="absolute top-20 right-20 text-4xl animate-spin opacity-15">🌾</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-25 animate-pulse">🥚</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce opacity-20">🐣</div>
        <div className="absolute top-1/2 left-1/4 text-3xl opacity-10 animate-spin">💰</div>
        <div className="absolute top-1/3 right-1/3 text-2xl opacity-15 animate-pulse">🎯</div>
      </div>

      {/* Enhanced Modal content with glass morphism */}
      <div className="relative bg-white/20 backdrop-blur-2xl rounded-3xl p-6 max-w-md w-full border border-white/30 shadow-2xl">
        {/* Gradient overlay for better glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent rounded-3xl"></div>
        {/* Header with language selector */}
        <div className="relative flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white drop-shadow-lg">
            {t.title}
          </h2>
          
          {/* Language switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`text-xl transition-all ${language === "en" ? "scale-110 drop-shadow-lg" : "opacity-70 hover:opacity-100"}`}
            >
              🇺🇸
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`text-xl transition-all ${language === "es" ? "scale-110 drop-shadow-lg" : "opacity-70 hover:opacity-100"}`}
            >
              🇪🇸
            </button>
          </div>
        </div>

        {/* Subtitle and description */}
        <div className="relative text-center mb-6">
          <p className="text-white/90 text-base font-medium mb-3 drop-shadow-lg">{t.subtitle}</p>
          <p className="text-white/80 text-sm leading-relaxed drop-shadow-md">{t.description}</p>
        </div>

        {/* Referral Feature Highlight */}
        <div className="relative bg-gradient-to-r from-yellow-400/20 via-orange-300/20 to-yellow-400/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-yellow-300/30">
          <h3 className="text-white font-bold text-sm mb-2 drop-shadow-lg">{t.referralTitle}</h3>
          <p className="text-white/90 text-xs leading-relaxed drop-shadow-md">{t.referralDescription}</p>
        </div>

        {/* Benefits */}
        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {t.benefits.map((benefit, index) => (
              <div key={index} className="text-white/90 font-medium drop-shadow-md flex items-center">
                <span className="mr-2">✨</span>
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Action button */}
        <div className="relative flex justify-center">
          <Button
            onClick={onClose}
            variant="primary"
            size="md"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold px-8 py-3 shadow-2xl border border-white/20 backdrop-blur-sm"
          >
            {t.startButton}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal; 
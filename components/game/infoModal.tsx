import React, { useState } from "react";
import Button from "../Button";

interface InfoModalProps {
  onClose: () => void;
  contractBalance: string;
  totalUsers?: number;
}

const InfoModal: React.FC<InfoModalProps> = ({ onClose, contractBalance, totalUsers = 1234 }) => {
  const [language, setLanguage] = useState<"en" | "es">("es");
  const [activeTab, setActiveTab] = useState<"howto" | "stats">("howto");

  const content = {
    en: {
      title: "🐔 Chicken Farm Info",
      tabs: {
        howto: "How to Play",
        stats: "Farm Stats"
      },
      howToPlay: {
                 title: "🎮 How to Play",
         subtitle: "Build your empire and earn daily!",
         steps: [
           {
             icon: "🛒",
             title: "1. Buy Chickens",
             description: "Purchase with WLD tokens"
           },
           {
             icon: "🥚",
             title: "2. Earn Eggs 24/7",
             description: "Automatic egg production"
           },
           {
             icon: "💰",
             title: "3. Sell for WLD",
             description: "Instant profits anytime"
           },
           {
             icon: "🐣",
             title: "4. Hatch More",
             description: "2.6M eggs = 1 new chicken"
           }
         ],
        roi: {
          title: "💎 Profit System",
          description: "Earn approximately 3% daily returns on your investment",
          highlight: "ROI: ~30 days to break even, then pure profit!"
        }
      },
      stats: {
        title: "📊 Farm Statistics",
        contractBalance: "Total Farm Pool",
        totalUsers: "Active Farmers",
        conversion: "Conversion Rate",
        conversionValue: "2.6M eggs = 1 chicken"
      }
    },
    es: {
      title: "🐔 Info de la Granja",
      tabs: {
        howto: "Cómo Jugar",
        stats: "Estadísticas"
      },
      howToPlay: {
                 title: "🎮 Cómo Jugar",
         subtitle: "¡Construye tu imperio y gana diario!",
         steps: [
           {
             icon: "🛒",
             title: "1. Compra Gallinas",
             description: "Con tokens WLD"
           },
           {
             icon: "🥚",
             title: "2. Gana Huevos 24/7",
             description: "Producción automática"
           },
           {
             icon: "💰",
             title: "3. Vende por WLD",
             description: "Ganancias instantáneas"
           },
           {
             icon: "🐣",
             title: "4. Eclosiona Más",
             description: "2.6M huevos = 1 gallina nueva"
           }
         ],
        roi: {
          title: "💎 Sistema de Ganancias",
          description: "Gana aproximadamente 3% de retorno diario en tu inversión",
          highlight: "ROI: ~30 días para recuperar inversión, ¡después pura ganancia!"
        }
      },
      stats: {
        title: "📊 Estadísticas de la Granja",
        contractBalance: "Pool Total de la Granja",
        totalUsers: "Granjeros Activos",
        conversion: "Tasa de Conversión",
        conversionValue: "2.6M huevos = 1 gallina"
      }
    }
  };

  const t = content[language];

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4 ">
      {/* Farm background animation */}
      

      {/* Modal content */}
      <div className="bg-gray-100/40 backdrop-blur-lg rounded-xl p-5 max-w-sm w-full max-h-[85vh] overflow-y-auto border-2 border-black/70 shadow-2xl relative">
        {/* Header with language selector */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 drop-shadow-sm">
            {t.title}
          </h2>
          
          {/* Language switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage("en")}
              className={`text-2xl transition-all ${language === "en" ? "scale-125" : "opacity-60 hover:opacity-100"}`}
            >
              🇺🇸
            </button>
            <button
              onClick={() => setLanguage("es")}
              className={`text-2xl transition-all ${language === "es" ? "scale-125" : "opacity-60 hover:opacity-100"}`}
            >
              🇪🇸
            </button>
          </div>
        </div>

        {/* Tabs */}
                 <div className="flex mb-3 bg-white/30 rounded-lg p-1">
           <button
             onClick={() => setActiveTab("howto")}
             className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
               activeTab === "howto" 
                 ? "bg-white text-green-700 shadow-lg" 
                 : "text-gray-700 hover:bg-white/20"
             }`}
           >
             {t.tabs.howto}
           </button>
           <button
             onClick={() => setActiveTab("stats")}
             className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
               activeTab === "stats" 
                 ? "bg-white text-green-700 shadow-lg" 
                 : "text-gray-700 hover:bg-white/20"
             }`}
           >
             {t.tabs.stats}
           </button>
         </div>

        {/* Content */}
                 {activeTab === "howto" ? (
           <div className="space-y-3">
             <div className="text-center mb-3">
               <h3 className="text-base font-bold text-gray-800 mb-1">{t.howToPlay.title}</h3>
               <p className="text-gray-700 text-xs">{t.howToPlay.subtitle}</p>
             </div>

             {/* Steps */}
             <div className="space-y-2">
               {t.howToPlay.steps.map((step, index) => (
                 <div key={index} className="bg-white/40 rounded-lg p-2 backdrop-blur">
                   <div className="flex items-start gap-2">
                     <div className="text-lg">{step.icon}</div>
                     <div>
                       <h4 className="font-bold text-gray-800 text-xs">{step.title}</h4>
                       <p className="text-gray-700 text-xs leading-relaxed">{step.description}</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>

             {/* ROI Section */}
             <div className="bg-gradient-to-r from-yellow-300 to-orange-300 rounded-lg p-3 border border-white/50 mt-3">
               <h4 className="font-bold text-gray-800 text-center mb-1 text-xs">{t.howToPlay.roi.title}</h4>
               <p className="text-gray-800 text-xs text-center mb-1">{t.howToPlay.roi.description}</p>
               <p className="text-gray-800 font-bold text-xs text-center bg-white/30 rounded-lg py-1">
                 {t.howToPlay.roi.highlight}
               </p>
             </div>
           </div>
                 ) : (
           <div className="space-y-3">
             <h3 className="text-base font-bold text-gray-800 text-center mb-3">{t.stats.title}</h3>
             
             <div className="grid gap-2">
               <div className="bg-white/40 rounded-lg p-3 backdrop-blur">
                 <div className="text-center">
                   <p className="text-gray-700 text-xs">{t.stats.contractBalance}</p>
                   <p className="text-gray-800 font-bold text-base">{parseFloat(contractBalance).toFixed(2)} WLD</p>
                 </div>
               </div>
               
               <div className="bg-white/40 rounded-lg p-3 backdrop-blur">
                 <div className="text-center">
                   <p className="text-gray-700 text-xs">{t.stats.totalUsers}</p>
                   <p className="text-gray-800 font-bold text-base">{totalUsers.toLocaleString()}</p>
                 </div>
               </div>
               
               <div className="bg-white/40 rounded-lg p-3 backdrop-blur">
                 <div className="text-center">
                   <p className="text-gray-700 text-xs">{t.stats.conversion}</p>
                   <p className="text-gray-800 font-bold text-xs">{t.stats.conversionValue}</p>
                 </div>
               </div>
             </div>
           </div>
        )}

                 {/* Close button */}
         <div className="mt-4">
           <Button 
             onClick={onClose} 
             variant="primary" 
             size="sm" 
             className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
           >
             🐔 {language === "en" ? "START FARMING!" : "¡EMPEZAR A CRIAR!"}
           </Button>
         </div>
      </div>
    </div>
  );
};

export default InfoModal; 
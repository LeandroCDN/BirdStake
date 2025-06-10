// ChickenFarm Configuration
// Update these addresses when contracts are deployed

export const CONTRACTS = {
  // Contract addresses - Update when deployed
  CHICKEN_FARM: "0xa41E4563d09871FF13Eb24CB384BB342b8aaf77e",
  PAYMENT_TOKEN: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003", // WLD token
  
  // Network settings
  WORLDCHAIN_RPC: "https://worldchain-mainnet.g.alchemy.com/public",
  CHAIN_ID: 1,
} as const;

// Game configuration
export const GAME_CONFIG = {
  // Amount options for buying eggs (in tokens)
  AMOUNT_OPTIONS: [0.1, 0.2, 0.5, 1, 2, 3, 5, 10],
  
  // Default referral address (0x0 = no referral)
  DEFAULT_REFERRAL: "0x8ea820f2c578b012bea3eec401fa1b8c750d71e5",
  
  // Number formatting thresholds
  FORMAT_THRESHOLDS: {
    BILLION: 1000000000,
    MILLION: 1000000,
    THOUSAND: 1000,
  },
} as const;

// UI Messages
export const MESSAGES = {
  TRANSACTION: {
    BUY_LOADING: "Buying Eggs...",
    HATCH_LOADING: "Hatching...",
    SELL_LOADING: "Selling...",
    PREPARING: "Preparing farm transaction...",
    PROCESSING: "Processing on the farm...",
  },
  SUCCESS: {
    BUY: "Eggs Purchased!",
    HATCH: "Eggs Hatched!",
    SELL: "Eggs Sold!",
  },
  ERROR: {
    LIMIT_REACHED: "Daily Farm Limit Reached",
    NOT_INITIALIZED: "Farm not initialized yet. Please wait for the farm to be ready.",
    NO_EGGS: "You need eggs to perform this action!",
  },
} as const;

// Farm emojis and theming
export const FARM_THEME = {
  EMOJIS: {
    CHICKEN: "🐔",
    EGG: "🥚",
    MONEY: "💰",
    COIN: "🪙",
    GRAIN: "🌾",
    CART: "🛒",
    HATCH: "🐣",
    WARNING: "⚠️",
  },
  COLORS: {
    BACKGROUND: "linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)",
    TOKEN_BALANCE: "from-yellow-400 to-orange-500",
    CHICKENS: "from-green-400 to-green-600",
    EGGS: "from-yellow-300 to-yellow-500",
    PROFIT: "from-purple-400 to-purple-600",
    BUY_BUTTON: "bg-green-500 hover:bg-green-600",
    HATCH_BUTTON: "bg-orange-500 hover:bg-orange-600",
    SELL_BUTTON: "bg-red-500 hover:bg-red-600",
  },
} as const;

// Utility functions
export const formatLargeNumber = (num: string | number): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  
  if (numValue >= GAME_CONFIG.FORMAT_THRESHOLDS.BILLION) {
    return (numValue / GAME_CONFIG.FORMAT_THRESHOLDS.BILLION).toFixed(1) + 'B';
  } else if (numValue >= GAME_CONFIG.FORMAT_THRESHOLDS.MILLION) {
    return (numValue / GAME_CONFIG.FORMAT_THRESHOLDS.MILLION).toFixed(1) + 'M';
  } else if (numValue >= GAME_CONFIG.FORMAT_THRESHOLDS.THOUSAND) {
    return (numValue / GAME_CONFIG.FORMAT_THRESHOLDS.THOUSAND).toFixed(1) + 'K';
  } else {
    return numValue.toFixed(2);
  }
};

export default {
  CONTRACTS,
  GAME_CONFIG,
  MESSAGES,
  FARM_THEME,
  formatLargeNumber,
}; 
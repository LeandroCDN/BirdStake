// Configuración de contratos de staking
export interface StakingPool {
    id: string;
    name: string;
    contractAddress: string;
    stakedTokenSymbol: string; // Solo para display, los addresses se obtienen del contrato
    rewardTokenSymbol: string; // Solo para display, los addresses se obtienen del contrato
    icon: string; // Emoji o icono
    description: string;
    totalRewardsPerDay: string;
}

// Lista de pools de staking disponibles
export const STAKING_POOLS: StakingPool[] = [
    // Start Date: 1754391600 - Tue Aug 05 2025 11:00:00 GMT+0000  (Tue Aug 05 2025 08:00:00 GMT-0300 (Argentina Standard Time))
    // end date: 1755860400 - Fri Aug 22 2025 08:00:00 GMT-0300 (Argentina Standard Time)
    // gems:0xAD3eE0342CB753C2B39579F9dB292A9Ae94b153E (18 decimals)
    // wld: 0x2cFc85d8E48F8EAB294be644d9E25C3030863003 (18 decimals)
    // usdc: 0x79A02482A880bCE3F13e09Da970dC34db4CD24d1 (6 decimals)
    // fee: 2%
    // feeWallet: 0xfee63b8c115031a1615870ff9e78365206acbaa3

    {
        id: "wld-gems",
        name: "WLD → GEMS",
        contractAddress: "0x9c11F5cd466B6788611bffde6Da5a520e00Bfc9A",
        stakedTokenSymbol: "WLD",
        rewardTokenSymbol: "GEMS", // 170_000 Gems -17 days (10000 Gems per day) (0.11574074074074074 gems/second)
        icon: "/ICONS/WLDgems.webp",
        description: "Stake WLD tokens to earn GEMS rewards",
        totalRewardsPerDay: "10000"
    },

    {
        id: "usdc-gems",
        name: "USDC → GEMS",
        contractAddress: "0x42584A11c5b6AD62FA7f6E001625Df48d9383A50",
        stakedTokenSymbol: "USDC",
        rewardTokenSymbol: "GEMS",  // 170_000 Gems -17 days (10000 Gems per day) (0.11574074074074074 gems/second)
        icon: "/ICONS/USDCgems.webp",
        description: "Stake USDC tokens to earn GEMS rewards",
        totalRewardsPerDay: "10000"
    },

    {
        id: "gems-wld",
        name: "GEMS → WLD",
        contractAddress: "0x511530875D287Bf512ef915E5a0995F45F0EB1B4",
        stakedTokenSymbol: "GEMS",
        rewardTokenSymbol: "WLD", // 595 WLD - 17 days (35 WLD per day) 
        icon: "/ICONS/GEMSwld.webp",
        description: "Stake GEMS tokens to earn WLD rewards",
        totalRewardsPerDay: "35"
    },

    {
        id: "gems-wld",
        name: "GEMS → USDC",
        contractAddress: "0x2b0858EA6746C29380db58Ac1c8f12c58E124FC5",
        stakedTokenSymbol: "GEMS",
        rewardTokenSymbol: "USDC", // 595 usdc - 17 days (35 usdc per day)
        icon: "/ICONS/GEMSusdc.webp",
        description: "Stake GEMS tokens to earn WLD rewards",
        totalRewardsPerDay: "35"
    },
];

// Helper function para obtener un pool por ID
export const getStakingPoolById = (id: string): StakingPool | undefined => {
    return STAKING_POOLS.find(pool => pool.id === id);
};

// Helper function para obtener pools activos (puedes agregar lógica de filtrado aquí)
export const getActiveStakingPools = (): StakingPool[] => {
    return STAKING_POOLS; // Por ahora retorna todos
};

// Helper function para calcular tiempo restante desde timestamp
export const calculateTimeRemaining = (endTimestamp: number): string => {
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    const timeLeft = endTimestamp - now;

    if (timeLeft <= 0) {
        return "Ended";
    }

    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);

    if (days > 0) {
        return `${days}d ${hours}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
};
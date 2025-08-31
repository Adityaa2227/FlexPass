// Blockchain configuration for real deployment
export const BLOCKCHAIN_CONFIG = {
  // Base Sepolia Testnet
  CHAIN_ID: 84532,
  RPC_URL: 'https://sepolia.base.org',
  EXPLORER_URL: 'https://sepolia.basescan.org/',
  CURRENCY: 'ETH',
  
  // Contract addresses (to be updated after deployment)
  CONTRACTS: {
    FLEX_PASS: process.env.VITE_CONTRACT_ADDRESS || '',
    USDC: process.env.VITE_USDC_CONTRACT_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
  },
  
  // CDP API Configuration
  CDP: {
    API_KEY: process.env.VITE_CDP_API_KEY || '',
    API_SECRET: process.env.VITE_CDP_API_SECRET || '',
    PROJECT_ID: process.env.VITE_CDP_PROJECT_ID || '',
  }
}

// Service configurations
export const SERVICES = {
  OPENAI: {
    id: 0,
    name: 'OpenAI Daily Pass',
    duration: 24 * 60 * 60, // 24 hours
    price: '0.001', // ETH
    icon: '🤖'
  },
  SPOTIFY: {
    id: 1,
    name: 'Spotify Hourly Pass', 
    duration: 1 * 60 * 60, // 1 hour
    price: '0.0005', // ETH
    icon: '🎵'
  },
  NETFLIX: {
    id: 2,
    name: 'Netflix Movie Pass',
    duration: 3 * 60 * 60, // 3 hours
    price: '0.002', // ETH
    icon: '🎬'
  }
}

export const getServiceById = (id: number) => {
  return Object.values(SERVICES).find(service => service.id === id)
}

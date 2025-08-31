export interface Provider {
  id: number
  name: string
  logoUrl: string
  hourlyRate: number // USDC with 6 decimals
  isActive: boolean
}

export interface Pass {
  tokenId: number
  providerId: number
  provider: Provider
  expirationTime: number
  pricePaid: number
  isActive: boolean
  isValid: boolean
  transactionHash: string
  owner: string
}

export interface PurchaseRequest {
  providerId: number
  durationSeconds: number
  totalPrice: number
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  usdcBalance: number
  isLoading: boolean
  error: string | null
}

export interface ContractAddresses {
  flexPass: string
  usdc: string
}

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: 'ChatGPT',
    logoUrl: 'https://cdn.openai.com/API/logo-openai.svg',
    hourlyRate: 1000000, // $1.00
    isActive: true
  },
  {
    id: 2,
    name: 'Spotify',
    logoUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png',
    hourlyRate: 500000, // $0.50
    isActive: true
  },
  {
    id: 3,
    name: 'Netflix',
    logoUrl: 'https://assets.brand.microsites.netflix.io/assets/2800a67c-4252-11ec-a9ce-066b49664af6_cm_800w.jpg',
    hourlyRate: 2000000, // $2.00
    isActive: true
  },
  {
    id: 4,
    name: 'Kindle',
    logoUrl: 'https://m.media-amazon.com/images/G/01/kindle/dp/2017/4911315144/LP_AG_HERO_LOGO_KINDLE._CB514508846_.png',
    hourlyRate: 750000, // $0.75
    isActive: true
  }
]

export const CONTRACT_ADDRESSES: ContractAddresses = {
  flexPass: import.meta.env.VITE_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890',
  usdc: import.meta.env.VITE_USDC_CONTRACT_ADDRESS || '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
}

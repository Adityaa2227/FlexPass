import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { ethers } from 'ethers'
import { BLOCKCHAIN_CONFIG } from '../config/blockchain'

interface CDPWalletContextType {
  isConnected: boolean
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  balance: string | null
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
  switchToPolygon: () => Promise<void>
}

export const CDPWalletContext = createContext<CDPWalletContextType | undefined>(undefined)

interface CDPWalletProviderProps {
  children: ReactNode
}

export function CDPWalletProvider({ children }: CDPWalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  // Initialize CDP Smart Wallet SDK
  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: 'Flex Pass',
    appLogoUrl: 'https://example.com/logo.png',
    darkMode: false
  })

  const ethereum = coinbaseWallet.makeWeb3Provider(
    BLOCKCHAIN_CONFIG.RPC_URL,
    BLOCKCHAIN_CONFIG.CHAIN_ID
  )

  const refreshBalance = async () => {
    if (!provider || !address) return
    
    try {
      const balanceWei = await provider.getBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(parseFloat(balanceEth).toFixed(4))
    } catch (error) {
      console.error('Failed to get balance:', error)
    }
  }

  const switchToPolygon = async () => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BLOCKCHAIN_CONFIG.CHAIN_ID.toString(16)}` }],
      })
    } catch (switchError: any) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${BLOCKCHAIN_CONFIG.CHAIN_ID.toString(16)}`,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: [BLOCKCHAIN_CONFIG.RPC_URL],
                blockExplorerUrls: [BLOCKCHAIN_CONFIG.EXPLORER_URL],
              },
            ],
          })
        } catch (addError) {
          console.error('Failed to add Polygon network:', addError)
          throw addError
        }
      } else {
        throw switchError
      }
    }
  }

  const connect = async () => {
    try {
      // Request account access
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      
      if (accounts && accounts.length > 0) {
        const ethersProvider = new ethers.BrowserProvider(ethereum)
        const ethersSigner = await ethersProvider.getSigner()
        const network = await ethersProvider.getNetwork()
        
        // Check if we're on the right network
        if (Number(network.chainId) !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
          await switchToPolygon()
        }
        
        setProvider(ethersProvider)
        setSigner(ethersSigner)
        setAddress(accounts[0])
        setChainId(Number(network.chainId))
        setIsConnected(true)
        
        // Store connection state
        localStorage.setItem('cdpWalletConnected', 'true')
        localStorage.setItem('cdpWalletAddress', accounts[0])
        
        // Get initial balance
        await refreshBalance()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setBalance(null)
    
    // Clear localStorage
    localStorage.removeItem('cdpWalletConnected')
    localStorage.removeItem('cdpWalletAddress')
  }

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const wasConnected = localStorage.getItem('cdpWalletConnected')
        const savedAddress = localStorage.getItem('cdpWalletAddress')
        
        if (wasConnected && savedAddress) {
          const accounts = await ethereum.request({ 
            method: 'eth_accounts' 
          }) as string[]
          
          if (accounts && accounts.length > 0 && accounts[0] === savedAddress) {
            await connect()
          } else {
            localStorage.removeItem('cdpWalletConnected')
            localStorage.removeItem('cdpWalletAddress')
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }

    checkConnection()
  }, [])

  // Listen for account and chain changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAddress(accounts[0])
        localStorage.setItem('cdpWalletAddress', accounts[0])
        refreshBalance()
      }
    }

    const handleChainChanged = (chainId: string) => {
      const newChainId = parseInt(chainId, 16)
      setChainId(newChainId)
      
      // If not on Polygon, prompt to switch
      if (newChainId !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
        switchToPolygon()
      }
    }

    if (ethereum) {
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('chainChanged', handleChainChanged)

      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [ethereum])

  const value: CDPWalletContextType = {
    isConnected,
    address,
    provider,
    signer,
    balance,
    chainId,
    connect,
    disconnect,
    refreshBalance,
    switchToPolygon
  }

  return (
    <CDPWalletContext.Provider value={value}>
      {children}
    </CDPWalletContext.Provider>
  )
}

export function useCDPWallet() {
  const context = useContext(CDPWalletContext)
  if (context === undefined) {
    throw new Error('useCDPWallet must be used within a CDPWalletProvider')
  }
  return context
}

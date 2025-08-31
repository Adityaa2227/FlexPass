import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { ethers } from 'ethers'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  connect: () => Promise<void>
  disconnect: () => void
  chainId: number | null
  balance: string | null
  refreshBalance: () => Promise<void>
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined)

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [isConnected, setIsConnected] = useState(() => {
    return localStorage.getItem('walletConnected') === 'true'
  })
  const [address, setAddress] = useState<string | null>(() => {
    return localStorage.getItem('walletAddress')
  })
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  // Initialize Coinbase Wallet SDK
  const coinbaseWallet = new CoinbaseWalletSDK({
    appName: 'Universal Web3 Micro-Subscription Pass',
    appLogoUrl: 'https://example.com/logo.png',
    darkMode: false
  })

  const ethereum = coinbaseWallet.makeWeb3Provider('https://polygon-amoy.g.alchemy.com/v2/your-api-key', 80002)

  const refreshBalance = async () => {
    // Mock balance refresh - no real blockchain calls
    if (!address) return
    
    try {
      // Simulate slight balance variation for demo
      const mockBalance = (1.5 + Math.random() * 0.1).toFixed(4)
      setBalance(mockBalance)
    } catch (error) {
      console.error('Failed to refresh balance:', error)
      setBalance('1.5000')
    }
  }

  const connect = async () => {
    try {
      // Request account access
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      
      if (accounts && accounts.length > 0) {
        // Demo mode - minimal wallet interaction
        setProvider(null) // No provider needed for demo
        setSigner(null) // No signer needed for demo
        setAddress(accounts[0])
        setChainId(80002) // Polygon Amoy testnet
        setIsConnected(true)
        
        // Store connection state
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletAddress', accounts[0])
        
        // Set mock balance for demo mode
        setBalance('1.5000')
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setBalance(null)
    // Clear localStorage on disconnect
    localStorage.removeItem('userPasses')
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
  }

  // Initialize demo state when address is restored from localStorage
  useEffect(() => {
    if (address && isConnected && !balance) {
      // Demo mode - just set mock balance, no blockchain calls
      setBalance('1.5000')
      setChainId(80002)
    }
  }, [address, isConnected, balance])

  // Restore connection state from localStorage on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem('walletConnected')
    const savedAddress = localStorage.getItem('walletAddress')
    
    if (wasConnected && savedAddress && !isConnected) {
      // Restore connection state without making blockchain calls
      setAddress(savedAddress)
      setIsConnected(true)
      setBalance('1.5000')
      setChainId(80002)
    }
  }, [])

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAddress(accounts[0])
      }
    }

    const handleChainChanged = (chainId: string) => {
      setChainId(parseInt(chainId, 16))
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

  const value: WalletContextType = {
    isConnected,
    address,
    provider,
    signer,
    connect,
    disconnect,
    chainId,
    balance,
    refreshBalance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

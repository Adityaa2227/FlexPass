import { useState, useEffect } from 'react'
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk'
import { ethers } from 'ethers'
import { BLOCKCHAIN_CONFIG } from '../config/blockchain'

interface CDPWalletState {
  isConnected: boolean
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  balance: string | null
  chainId: number | null
  connect: () => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

export function useCDPWallet(): CDPWalletState {
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

  const connect = async () => {
    try {
      // Check if MetaMask or other wallet is available as fallback
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        }) as string[]
        
        if (accounts && accounts.length > 0) {
          const ethersProvider = new ethers.BrowserProvider(window.ethereum)
          const ethersSigner = await ethersProvider.getSigner()
          const network = await ethersProvider.getNetwork()
          
          // Check if we're on the correct network
          if (Number(network.chainId) !== BLOCKCHAIN_CONFIG.CHAIN_ID) {
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${BLOCKCHAIN_CONFIG.CHAIN_ID.toString(16)}` }],
              })
            } catch (switchError: any) {
              // If the chain doesn't exist, add it
              if (switchError.code === 4902) {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: `0x${BLOCKCHAIN_CONFIG.CHAIN_ID.toString(16)}`,
                    chainName: 'Base Sepolia',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: [BLOCKCHAIN_CONFIG.RPC_URL],
                    blockExplorerUrls: [BLOCKCHAIN_CONFIG.EXPLORER_URL],
                  }],
                })
              }
            }
          }
          
          setProvider(ethersProvider)
          setSigner(ethersSigner)
          setAddress(accounts[0])
          setChainId(Number(network.chainId))
          setIsConnected(true)
          
          // Store connection state
          localStorage.setItem('walletConnected', 'true')
          localStorage.setItem('walletAddress', accounts[0])
          
          // Get initial balance
          await refreshBalance()
          return
        }
      }
      
      // Fallback to Coinbase SDK
      const accounts = await ethereum.request({ 
        method: 'eth_requestAccounts' 
      }) as string[]
      
      if (accounts && accounts.length > 0) {
        const ethersProvider = new ethers.BrowserProvider(ethereum)
        const ethersSigner = await ethersProvider.getSigner()
        const network = await ethersProvider.getNetwork()
        
        setProvider(ethersProvider)
        setSigner(ethersSigner)
        setAddress(accounts[0])
        setChainId(Number(network.chainId))
        setIsConnected(true)
        
        // Store connection state
        localStorage.setItem('walletConnected', 'true')
        localStorage.setItem('walletAddress', accounts[0])
        
        // Get initial balance
        await refreshBalance()
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      // Don't throw error, just log it to prevent app crash
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
    localStorage.removeItem('walletConnected')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('userPasses')
  }

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const wasConnected = localStorage.getItem('walletConnected')
        const savedAddress = localStorage.getItem('walletAddress')
        
        if (wasConnected && savedAddress) {
          const accounts = await ethereum.request({ 
            method: 'eth_accounts' 
          }) as string[]
          
          if (accounts && accounts.length > 0 && accounts[0] === savedAddress) {
            await connect()
          } else {
            localStorage.removeItem('walletConnected')
            localStorage.removeItem('walletAddress')
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }

    checkConnection()
  }, [])

  // Listen for account changes
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        setAddress(accounts[0])
        localStorage.setItem('walletAddress', accounts[0])
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

  return {
    isConnected,
    address,
    provider,
    signer,
    balance,
    chainId,
    connect,
    disconnect,
    refreshBalance
  }
}

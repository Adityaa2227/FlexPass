import { ethers } from 'ethers'

// Base Sepolia network configuration
const BASE_SEPOLIA_CONFIG = {
  chainId: 84532,
  chainName: 'Base Sepolia',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org/'],
}

// USDC contract address on Base Sepolia
const USDC_CONTRACT_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

export interface X402PaymentDetails {
  amount: string // Amount in USDC (e.g., "0.05")
  recipient: string // Recipient address
  currency: string // "USDC"
  network: string // "base-sepolia"
  description?: string
  facilitatorUrl?: string
}

export interface PaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}

/**
 * Parse x402 payment details from HTTP 402 response
 * @param response - The 402 response from the server
 * @returns Parsed payment details
 */
export function parseX402Response(response: any): X402PaymentDetails | null {
  try {
    // The x402-express middleware should return payment details in the response
    // Check for common x402 response formats
    if (response.paymentRequired || response.payment) {
      const paymentData = response.paymentRequired || response.payment
      return {
        amount: paymentData.amount || '0.05',
        recipient: paymentData.recipient || paymentData.to,
        currency: paymentData.currency || 'USDC',
        network: paymentData.network || 'base-sepolia',
        description: paymentData.description,
        facilitatorUrl: paymentData.facilitatorUrl
      }
    }

    // Fallback: extract from headers or standard format
    return {
      amount: '0.05', // Default from your server config
      recipient: '0xF932511A24D302d14317C861c6A9B4F408cb9057', // Your server address
      currency: 'USDC',
      network: 'base-sepolia',
      description: 'Access to premium FlexPass data'
    }
  } catch (error) {
    console.error('Failed to parse x402 response:', error)
    return null
  }
}

/**
 * Switch to Base Sepolia network if not already connected
 * @param ethereum - The ethereum provider
 */
async function ensureBaseSepolia(ethereum: any): Promise<void> {
  try {
    // Check current network
    const chainId = await ethereum.request({ method: 'eth_chainId' })
    const currentChainId = parseInt(chainId, 16)

    if (currentChainId !== BASE_SEPOLIA_CONFIG.chainId) {
      try {
        // Try to switch to Base Sepolia
        await ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${BASE_SEPOLIA_CONFIG.chainId.toString(16)}` }],
        })
      } catch (switchError: any) {
        // If network doesn't exist, add it
        if (switchError.code === 4902) {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BASE_SEPOLIA_CONFIG],
          })
        } else {
          throw switchError
        }
      }
    }
  } catch (error) {
    console.error('Failed to switch to Base Sepolia:', error)
    throw new Error('Please switch to Base Sepolia network to complete payment')
  }
}

/**
 * Handle x402 payment using Coinbase Wallet SDK
 * @param paymentDetails - Payment details from x402 response
 * @param ethereum - The ethereum provider from wallet
 * @returns Payment result with transaction hash or error
 */
export async function handleX402Payment(
  paymentDetails: X402PaymentDetails,
  ethereum: any
): Promise<PaymentResult> {
  try {
    // Ensure we're on Base Sepolia network
    await ensureBaseSepolia(ethereum)

    // Get current account
    const accounts = await ethereum.request({ method: 'eth_accounts' })
    if (!accounts || accounts.length === 0) {
      throw new Error('No wallet account connected')
    }

    const fromAddress = accounts[0]
    const { amount, recipient, currency } = paymentDetails

    if (currency.toUpperCase() === 'USDC') {
      // Send USDC token transaction
      const usdcAmount = ethers.parseUnits(amount, 6) // USDC has 6 decimals

      // ERC-20 transfer function signature
      const transferFunction = '0xa9059cbb' // transfer(address,uint256)
      const recipientPadded = recipient.slice(2).padStart(64, '0')
      const amountPadded = usdcAmount.toString(16).padStart(64, '0')
      const data = transferFunction + recipientPadded + amountPadded

      // Send USDC transfer transaction
      const transactionHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: USDC_CONTRACT_ADDRESS,
          data: data,
          gas: '0x15F90', // 90000 gas limit
        }],
      })

      return {
        success: true,
        transactionHash
      }
    } else {
      // Send native ETH transaction (fallback)
      const ethAmount = ethers.parseEther(amount)

      const transactionHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: fromAddress,
          to: recipient,
          value: `0x${ethAmount.toString(16)}`,
          gas: '0x5208', // 21000 gas limit for ETH transfer
        }],
      })

      return {
        success: true,
        transactionHash
      }
    }
  } catch (error: any) {
    console.error('Payment failed:', error)
    
    // Handle specific error cases
    if (error.code === 4001) {
      return {
        success: false,
        error: 'Payment cancelled by user'
      }
    } else if (error.message?.includes('insufficient funds')) {
      return {
        success: false,
        error: 'Insufficient USDC balance'
      }
    } else if (error.message?.includes('network')) {
      return {
        success: false,
        error: 'Network error - please check your connection'
      }
    }

    return {
      success: false,
      error: error.message || 'Payment failed'
    }
  }
}

/**
 * Wait for transaction confirmation
 * @param transactionHash - The transaction hash to monitor
 * @param ethereum - The ethereum provider
 * @param maxWaitTime - Maximum time to wait in milliseconds (default: 60s)
 */
export async function waitForTransactionConfirmation(
  transactionHash: string,
  ethereum: any,
  maxWaitTime: number = 60000
): Promise<boolean> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [transactionHash],
      })

      if (receipt && receipt.status === '0x1') {
        return true // Transaction confirmed successfully
      } else if (receipt && receipt.status === '0x0') {
        return false // Transaction failed
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Error checking transaction status:', error)
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  return false // Timeout
}

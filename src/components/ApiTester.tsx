import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Lock, CheckCircle, AlertCircle, Loader2, Wallet, CreditCard } from 'lucide-react'
import { apiService, ApiResponse, FreeDataResponse, PremiumDataResponse } from '../services/apiService'
import { useCDPWallet } from '../hooks/useCDPWallet'
import { handleX402Payment, parseX402Response, waitForTransactionConfirmation, X402PaymentDetails, PaymentResult } from '../utils/x402PaymentHandler'

// Payment flow states
type PaymentState = 'idle' | 'payment_required' | 'connecting_wallet' | 'processing_payment' | 'confirming_transaction' | 'retrying_request' | 'payment_success' | 'payment_failed'

interface ApiTestResult {
  type: 'free' | 'premium'
  loading: boolean
  response?: ApiResponse<any>
  timestamp: string
  paymentState?: PaymentState
  paymentDetails?: X402PaymentDetails
  transactionHash?: string
  paymentError?: string
}

export function ApiTester() {
  const [results, setResults] = useState<ApiTestResult[]>([])
  const { isConnected, connect, provider } = useCDPWallet()

  const addResult = (type: 'free' | 'premium', response: ApiResponse<any>, paymentState?: PaymentState, paymentDetails?: X402PaymentDetails, transactionHash?: string, paymentError?: string) => {
    const newResult: ApiTestResult = {
      type,
      loading: false,
      response,
      timestamp: new Date().toLocaleTimeString(),
      paymentState,
      paymentDetails,
      transactionHash,
      paymentError
    }
    setResults(prev => [newResult, ...prev.slice(0, 4)]) // Keep last 5 results
  }

  const updateCurrentResult = (updates: Partial<ApiTestResult>) => {
    setResults(prev => {
      if (prev.length === 0) return prev
      const updated = [...prev]
      updated[0] = { ...updated[0], ...updates }
      return updated
    })
  }

  const setLoading = (type: 'free' | 'premium', paymentState: PaymentState = 'idle') => {
    const loadingResult: ApiTestResult = {
      type,
      loading: true,
      timestamp: new Date().toLocaleTimeString(),
      paymentState
    }
    setResults(prev => [loadingResult, ...prev.slice(0, 4)])
  }

  const handleFreeData = async () => {
    setLoading('free')
    try {
      const response = await apiService.getFreeData()
      addResult('free', response)
    } catch (error) {
      addResult('free', {
        success: false,
        error: 'Network error',
        status: 0
      })
    }
  }

  const handlePremiumData = async () => {
    setLoading('premium')
    try {
      const response = await apiService.getPremiumData()
      
      // Check if payment is required (HTTP 402)
      if (response.status === 402) {
        // Parse payment details from response
        const paymentDetails = parseX402Response(response.data)
        
        if (!paymentDetails) {
          addResult('premium', response, 'payment_failed', undefined, undefined, 'Failed to parse payment details')
          return
        }

        // Update result with payment required state
        addResult('premium', response, 'payment_required', paymentDetails)
        
        // Start payment flow
        await processPayment(paymentDetails)
      } else {
        // Success response
        addResult('premium', response)
      }
    } catch (error) {
      addResult('premium', {
        success: false,
        error: 'Network error',
        status: 0
      }, 'payment_failed', undefined, undefined, 'Network error')
    }
  }

  const processPayment = async (paymentDetails: X402PaymentDetails) => {
    try {
      // Step 1: Ensure wallet is connected
      if (!isConnected) {
        updateCurrentResult({ paymentState: 'connecting_wallet' })
        await connect()
      }

      // Step 2: Get ethereum provider
      if (!provider || !window.ethereum) {
        updateCurrentResult({ 
          paymentState: 'payment_failed', 
          paymentError: 'Wallet provider not available' 
        })
        return
      }

      // Step 3: Process payment
      updateCurrentResult({ paymentState: 'processing_payment' })
      const paymentResult: PaymentResult = await handleX402Payment(paymentDetails, window.ethereum)

      if (!paymentResult.success) {
        updateCurrentResult({ 
          paymentState: 'payment_failed', 
          paymentError: paymentResult.error 
        })
        return
      }

      // Step 4: Wait for transaction confirmation
      if (paymentResult.transactionHash) {
        updateCurrentResult({ 
          paymentState: 'confirming_transaction',
          transactionHash: paymentResult.transactionHash
        })

        const confirmed = await waitForTransactionConfirmation(
          paymentResult.transactionHash, 
          window.ethereum,
          30000 // 30 second timeout
        )

        if (!confirmed) {
          updateCurrentResult({ 
            paymentState: 'payment_failed', 
            paymentError: 'Transaction confirmation timeout' 
          })
          return
        }
      }

      // Step 5: Retry the premium request
      updateCurrentResult({ paymentState: 'retrying_request' })
      
      // Wait a moment for the payment to be processed by the backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const retryResponse = await apiService.getPremiumData()
      
      if (retryResponse.success) {
        updateCurrentResult({ 
          paymentState: 'payment_success',
          response: retryResponse,
          loading: false
        })
      } else {
        updateCurrentResult({ 
          paymentState: 'payment_failed', 
          paymentError: 'Premium data still not accessible after payment' 
        })
      }

    } catch (error: any) {
      updateCurrentResult({ 
        paymentState: 'payment_failed', 
        paymentError: error.message || 'Payment processing failed' 
      })
    }
  }

  const getPaymentStateMessage = (state: PaymentState) => {
    switch (state) {
      case 'payment_required': return '💳 Payment Required'
      case 'connecting_wallet': return '🔗 Connecting wallet...'
      case 'processing_payment': return '💸 Processing payment...'
      case 'confirming_transaction': return '⏳ Confirming transaction...'
      case 'retrying_request': return '🔄 Retrying request...'
      case 'payment_success': return '✅ Payment successful, premium data unlocked'
      case 'payment_failed': return '❌ Payment failed'
      default: return ''
    }
  }

  const renderResponse = (result: ApiTestResult) => {
    if (result.loading) {
      const loadingMessage = result.paymentState && result.paymentState !== 'idle' 
        ? getPaymentStateMessage(result.paymentState)
        : 'Loading...'
      
      return (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingMessage}</span>
        </div>
      )
    }

    if (!result.response) return null

    const { response } = result
    const isPaymentRequired = response.status === 402

    // Handle payment flow states
    if (result.paymentState && result.paymentState !== 'idle') {
      const stateMessage = getPaymentStateMessage(result.paymentState)
      const isSuccess = result.paymentState === 'payment_success'
      const isFailed = result.paymentState === 'payment_failed'
      
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : isFailed ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
            <span className={`text-sm font-medium ${
              isSuccess ? 'text-green-600 dark:text-green-400' : 
              isFailed ? 'text-red-600 dark:text-red-400' : 
              'text-blue-600 dark:text-blue-400'
            }`}>
              {stateMessage}
            </span>
          </div>

          {/* Payment Details */}
          {result.paymentDetails && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <div><strong>Amount:</strong> {result.paymentDetails.amount} {result.paymentDetails.currency}</div>
                <div><strong>Network:</strong> {result.paymentDetails.network}</div>
                <div><strong>Recipient:</strong> {result.paymentDetails.recipient.slice(0, 10)}...{result.paymentDetails.recipient.slice(-8)}</div>
                {result.paymentDetails.description && (
                  <div><strong>Description:</strong> {result.paymentDetails.description}</div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Hash */}
          {result.transactionHash && (
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-700 dark:text-gray-300">
                <strong>Transaction:</strong> 
                <a 
                  href={`https://sepolia.basescan.org/tx/${result.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  {result.transactionHash.slice(0, 10)}...{result.transactionHash.slice(-8)}
                </a>
              </div>
            </div>
          )}

          {/* Payment Error */}
          {result.paymentError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">
                {result.paymentError}
              </p>
            </div>
          )}

          {/* Success Response Data */}
          {isSuccess && result.response?.success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="text-sm text-green-800 dark:text-green-200">
                <div className="font-medium mb-1">
                  {(result.response.data as FreeDataResponse | PremiumDataResponse)?.message}
                </div>
                {(result.response.data as PremiumDataResponse)?.premiumContent && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div><strong>Analytics:</strong> {(result.response.data as PremiumDataResponse).premiumContent.analytics}</div>
                    <div><strong>Insights:</strong> {(result.response.data as PremiumDataResponse).premiumContent.insights}</div>
                    <div><strong>Features:</strong> {(result.response.data as PremiumDataResponse).premiumContent.features}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )
    }

    // Standard response handling (no payment flow)
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {response.success ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            response.success ? 'text-green-600 dark:text-green-400' : 
            isPaymentRequired ? 'text-yellow-600 dark:text-yellow-400' : 
            'text-red-600 dark:text-red-400'
          }`}>
            {response.success ? 'Success' : 
             isPaymentRequired ? 'Payment Required' : 
             'Error'}
          </span>
          <span className="text-xs text-gray-500">
            HTTP {response.status || 'N/A'}
          </span>
        </div>

        {response.success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="text-sm text-green-800 dark:text-green-200">
              <div className="font-medium mb-1">
                {(response.data as FreeDataResponse | PremiumDataResponse)?.message}
              </div>
              {(response.data as PremiumDataResponse)?.premiumContent && (
                <div className="mt-2 space-y-1 text-xs">
                  <div><strong>Analytics:</strong> {(response.data as PremiumDataResponse).premiumContent.analytics}</div>
                  <div><strong>Insights:</strong> {(response.data as PremiumDataResponse).premiumContent.insights}</div>
                  <div><strong>Features:</strong> {(response.data as PremiumDataResponse).premiumContent.features}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-200">
              {response.error || 'Unknown error'}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Backend API Tester
      </h3>

      {/* Wallet Status */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Wallet Status:
          </span>
          <span className={`text-sm ${
            isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
        {!isConnected && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Connect your wallet to enable premium data payments
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleFreeData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Get Free Data
        </button>

        <button
          onClick={handlePremiumData}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors relative"
        >
          <Lock className="w-4 h-4" />
          Get Premium Data
          {!isConnected && (
            <CreditCard className="w-4 h-4 ml-1 text-purple-200" />
          )}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Results
          </h4>
          <div className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={`${result.type}-${result.timestamp}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {result.type === 'free' ? (
                      <Download className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Lock className="w-4 h-4 text-purple-500" />
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {result.type === 'free' ? 'Free API' : 'Premium API'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {result.timestamp}
                  </span>
                </div>
                {renderResponse(result)}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">
          How it works:
        </h5>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• <strong>Free Data:</strong> Returns immediately with free content</li>
          <li>• <strong>Premium Data:</strong> Requires 0.05 USDC payment on Base Sepolia</li>
          <li>• <strong>Payment Flow:</strong> Connects wallet → Sends USDC → Retries request</li>
          <li>• <strong>Network:</strong> Automatically switches to Base Sepolia if needed</li>
          <li>• Backend must be running on <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">localhost:3001</code></li>
        </ul>
        
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Note:</strong> You need USDC on Base Sepolia testnet to test payments. 
            Get testnet USDC from the Base Sepolia faucet.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

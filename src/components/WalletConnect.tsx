import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, AlertCircle } from 'lucide-react'
import { useCDPWallet } from '../hooks/useCDPWallet'
import toast from 'react-hot-toast'

export function WalletConnect() {
  const { connect } = useCDPWallet()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      await connect()
      toast.success('Wallet connected successfully!')
    } catch (error) {
      console.error('Connection failed:', error)
      toast.error('Failed to connect wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect your wallet to start purchasing and managing your FlexPass subscriptions
            </p>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                Connect Wallet
              </>
            )}
          </button>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-medium mb-1">Supported Wallets:</p>
                <ul className="text-xs space-y-1">
                  <li>• MetaMask</li>
                  <li>• Coinbase Wallet</li>
                  <li>• Other Web3 wallets</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Available providers:</p>
            <div className="flex justify-center space-x-4 mt-2">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">ChatGPT</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Spotify</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Netflix</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Kindle</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

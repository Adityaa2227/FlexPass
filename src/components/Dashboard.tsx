import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Wallet, DollarSign, Clock, Zap } from 'lucide-react'
import { useCDPWallet } from '../hooks/useCDPWallet'
import { useFlexPass } from '../hooks/useFlexPass'
import { PassCard } from './PassCard'
import { AddBalanceModal } from './AddBalanceModal'
import { Pass } from '../types'

export function Dashboard() {
  const { address, isConnected } = useCDPWallet()
  const { userPasses, usdcBalance, isLoading, refreshData } = useFlexPass()
  const [showAddBalanceModal, setShowAddBalanceModal] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      refreshData()
    }
  }, [isConnected, address, refreshData])

  const activePasses = userPasses.filter(pass => pass.isActive && pass.isValid)
  const expiredPasses = userPasses.filter(pass => !pass.isActive || !pass.isValid)

  const formatUSDC = (amount: number) => {
    return (amount / 1000000).toFixed(2)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please connect your wallet to view your FlexPass dashboard
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">USDC Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${5+formatUSDC(usdcBalance)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <button
              onClick={() => setShowAddBalanceModal(true)}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add Balance
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Passes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activePasses.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Wallet</p>
                <p className="text-sm font-mono text-gray-900 dark:text-white">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Active Passes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Passes</h2>
            <Link
              to="/buy"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buy Pass
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : activePasses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activePasses.map((pass: Pass, index: number) => (
                <motion.div
                  key={pass.tokenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PassCard pass={pass} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center"
            >
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Active Passes
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Purchase your first FlexPass to get started with premium services
              </p>
              <Link
                to="/buy"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Buy Your First Pass
              </Link>
            </motion.div>
          )}
        </div>

        {/* Expired Passes */}
        {expiredPasses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Expired Passes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {expiredPasses.map((pass: Pass, index: number) => (
                <motion.div
                  key={pass.tokenId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PassCard pass={pass} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Balance Modal */}
      {showAddBalanceModal && (
        <AddBalanceModal
          onClose={() => setShowAddBalanceModal(false)}
        />
      )}
    </div>
  )
}

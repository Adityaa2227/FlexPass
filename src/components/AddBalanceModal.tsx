import { useState } from 'react'
import { X, ExternalLink } from 'lucide-react'

interface AddBalanceModalProps {
  onClose: () => void
}

export function AddBalanceModal({ onClose }: AddBalanceModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(10)

  const faucetUrl = 'https://faucet.circle.com/'
  const quickAmounts = [5, 10, 25, 50, 100]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add USDC Balance</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Get USDC from the Circle faucet to purchase passes on Base Sepolia testnet.
            </p>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => setSelectedAmount(amount)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    selectedAmount === amount
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 dark:text-yellow-400 text-sm">⚠️</div>
              <div>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  Testnet Only
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This is Base Sepolia testnet USDC. It has no real value and is only for testing purposes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <a
              href={faucetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Open Faucet
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

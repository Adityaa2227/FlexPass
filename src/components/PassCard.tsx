import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ExternalLink, RotateCcw, Plus, X } from 'lucide-react'
import { Pass } from '../types'
import { useFlexPass } from '../hooks/useFlexPass'

interface PassCardProps {
  pass: Pass
}

export function PassCard({ pass }: PassCardProps) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [progress, setProgress] = useState(0)
  const { extendPass, revokePass, isLoading } = useFlexPass()

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now()
      const remaining = (pass.expirationTime * 1000) - now
      const totalDuration = 24 * 60 * 60 * 1000 // Assume 24h for progress calculation

      if (remaining <= 0) {
        setTimeRemaining('Expired')
        setProgress(0)
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }

      setProgress(Math.max(0, Math.min(100, (remaining / totalDuration) * 100)))
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [pass.expirationTime])

  const handleExtend = async () => {
    const additionalHours = 1 // Extend by 1 hour
    await extendPass(pass.tokenId, additionalHours * 3600)
  }

  const handleRevoke = async () => {
    if (window.confirm('Are you sure you want to revoke this pass? This action cannot be undone.')) {
      await revokePass(pass.tokenId)
    }
  }

  const handleAccess = () => {
    // Open provider's website or API endpoint
    const providerUrls: { [key: string]: string } = {
      'ChatGPT': 'https://chat.openai.com',
      'Spotify': 'https://open.spotify.com',
      'Netflix': 'https://netflix.com',
      'Kindle': 'https://read.amazon.com'
    }
    
    const url = providerUrls[pass.provider.name] || '#'
    if (url !== '#') {
      window.open(url, '_blank')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 overflow-hidden ${
        pass.isValid 
          ? 'border-green-200 dark:border-green-800' 
          : 'border-red-200 dark:border-red-800'
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={pass.provider.logoUrl}
              alt={pass.provider.name}
              className="w-12 h-12 rounded-xl object-contain bg-gray-50 dark:bg-gray-700 p-2"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://ui-avatars.com/api/?name=${pass.provider.name}&background=random`
              }}
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {pass.provider.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Token #{pass.tokenId}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            pass.isValid
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {pass.isValid ? 'Active' : 'Expired'}
          </div>
        </div>

        {/* Time Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Time Remaining</span>
            </div>
            <span className={`font-mono text-sm font-medium ${
              pass.isValid ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {timeRemaining}
            </span>
          </div>
          
          {pass.isValid && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          )}
        </div>

        {/* Price Info */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Paid: ${(pass.pricePaid / 1e6).toFixed(2)} USDC
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex gap-2">
          {pass.isValid ? (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAccess}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Access
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExtend}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Extend
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRevoke}
                disabled={isLoading}
                className="px-3 py-2.5 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <Link to="/buy" className="flex-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Renew Pass
              </motion.button>
            </Link>
          )}
        </div>
        
        <Link 
          to={`/pass/${pass.tokenId}`}
          className="block mt-3 text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  )
}

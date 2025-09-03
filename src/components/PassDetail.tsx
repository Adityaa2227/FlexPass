import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, ExternalLink, Plus, X, Copy, CheckCircle } from 'lucide-react'
import { useFlexPass } from '../hooks/useFlexPass'
import { Pass } from '../types'

export function PassDetail() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const navigate = useNavigate()
  const { userPasses, extendPass, revokePass, isLoading } = useFlexPass()
  const [pass, setPass] = useState<Pass | null>(null)
  const [timeRemaining, setTimeRemaining] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (tokenId && userPasses.length > 0) {
      const foundPass = userPasses.find(p => p.tokenId === parseInt(tokenId))
      setPass(foundPass || null)
    }
  }, [tokenId, userPasses])

  useEffect(() => {
    if (!pass) return

    const updateTimer = () => {
      const now = Date.now()
      const remaining = pass.expirationTime - now

      if (remaining <= 0) {
        setTimeRemaining('Expired')
        return
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [pass])

  const handleExtend = async () => {
    if (!pass) return
    const additionalHours = 1
    await extendPass(pass.tokenId, additionalHours * 3600)
  }

  const handleRevoke = async () => {
    if (!pass) return
    if (window.confirm('Are you sure you want to revoke this pass? This action cannot be undone.')) {
      const success = await revokePass(pass.tokenId)
      if (success) {
        navigate('/')
      }
    }
  }

  const handleAccess = () => {
    if (!pass) return
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!pass) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pass Not Found</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The pass you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {pass.provider.name} Pass
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Token #{pass.tokenId}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pass Status</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    pass.isValid
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {pass.isValid ? 'Active' : 'Expired'}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time Remaining</p>
                  <p className={`font-mono text-lg font-bold ${
                    pass.isValid ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {timeRemaining}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Expiry Date</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(pass.expirationTime * 1000).toLocaleString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price Paid</p>
                  <p className="text-gray-900 dark:text-white font-semibold">
                    ${(pass.pricePaid / 1e6).toFixed(2)} USDC
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Transaction Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Token ID</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm">
                      {pass.tokenId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(pass.tokenId.toString())}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {pass.transactionHash && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transaction Hash</p>
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm break-all">
                        {pass.transactionHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(pass.transactionHash)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Provider Rate</p>
                  <p className="text-gray-900 dark:text-white">
                    ${(pass.provider.hourlyRate / 1e6).toFixed(2)} USDC per hour
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Actions</h3>
              
              <div className="space-y-3">
                {pass.isValid ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAccess}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Access {pass.provider.name}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleExtend}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Extend Pass
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRevoke}
                      disabled={isLoading}
                      className="w-full border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Revoke Pass
                    </motion.button>
                  </>
                ) : (
                  <Link to="/buy" className="block">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Buy New Pass
                    </motion.button>
                  </Link>
                )}
              </div>
            </div>

            {/* Provider Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Provider Info</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={pass.provider.logoUrl}
                    alt={pass.provider.name}
                    className="w-10 h-10 rounded-lg object-contain bg-gray-50 dark:bg-gray-700 p-2"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {pass.provider.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Premium Service
                    </p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Hourly Rate</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${(pass.provider.hourlyRate / 1e6).toFixed(2)} USDC
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, DollarSign, Check, Loader2 } from 'lucide-react'
import { useFlexPass } from '../hooks/useFlexPass'
import { Provider } from '../types'

export function BuyFlow() {
  const navigate = useNavigate()
  const { providers, buyPass, isLoading } = useFlexPass()
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [durationType, setDurationType] = useState<'hours' | 'days'>('hours')
  const [duration, setDuration] = useState(1)
  const [step, setStep] = useState<'select' | 'configure' | 'checkout' | 'success'>('select')
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const durationInSeconds = durationType === 'hours' ? duration * 3600 : duration * 24 * 3600
  const totalPrice = selectedProvider ? (selectedProvider.hourlyRate * Math.ceil(durationInSeconds / 3600)) / 1e6 : 0

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider)
    setStep('configure')
  }

  const handlePurchase = async () => {
    if (!selectedProvider) return
    
    setStep('checkout')
    const txHash = await buyPass(selectedProvider.id, durationInSeconds)
    
    if (txHash) {
      setTransactionHash(txHash)
      setStep('success')
    } else {
      setStep('configure')
    }
  }

  const renderProviderSelect = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Choose a Provider</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleProviderSelect(provider)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
          >
            <div className="flex items-center gap-4 mb-4">
              <img
                src={provider.logoUrl}
                alt={provider.name}
                className="w-12 h-12 rounded-lg object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `https://ui-avatars.com/api/?name=${provider.name}&background=random`
                }}
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{provider.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">Premium Access</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <DollarSign className="w-4 h-4" />
                <span className="font-semibold">${(provider.hourlyRate / 1e6).toFixed(2)}/hour</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Click to select
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderConfiguration = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setStep('select')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configure Your Pass</h1>
      </div>

      {selectedProvider && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={selectedProvider.logoUrl}
              alt={selectedProvider.name}
              className="w-16 h-16 rounded-lg object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = `https://ui-avatars.com/api/?name=${selectedProvider.name}&background=random`
              }}
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProvider.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">${(selectedProvider.hourlyRate / 1e6).toFixed(2)} per hour</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Duration Type
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setDurationType('hours')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    durationType === 'hours'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-1" />
                  Hours
                </button>
                <button
                  onClick={() => setDurationType('days')}
                  className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                    durationType === 'days'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Clock className="w-5 h-5 mx-auto mb-1" />
                  Days
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Duration ({durationType})
              </label>
              <input
                type="number"
                min="1"
                max={durationType === 'hours' ? 168 : 30}
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {duration} {durationType}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${(selectedProvider.hourlyRate / 1e6).toFixed(2)}/hour
                </span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold">
                <span className="text-gray-900 dark:text-white">Total:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ${totalPrice.toFixed(2)} USDC
                </span>
              </div>
            </div>

            <button
              onClick={handlePurchase}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-medium transition-all shadow-lg text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </div>
              ) : (
                `Purchase Pass for $${totalPrice.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderCheckout = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Processing Purchase</h1>
        <div className="flex justify-center mb-6">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Please confirm the transaction in your wallet...
        </p>
      </div>
    </div>
  )

  const renderSuccess = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Pass Purchased!</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your {selectedProvider?.name} pass is now active and ready to use.
        </p>
        
        {transactionHash && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Transaction Hash:</p>
            <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
              {transactionHash}
            </p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            View Dashboard
          </button>
          <button
            onClick={() => {
              setStep('select')
              setSelectedProvider(null)
              setTransactionHash(null)
            }}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Buy Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {step === 'select' && renderProviderSelect()}
      {step === 'configure' && renderConfiguration()}
      {step === 'checkout' && renderCheckout()}
      {step === 'success' && renderSuccess()}
    </div>
  )
}

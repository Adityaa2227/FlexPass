import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, DollarSign, Settings, Users } from 'lucide-react'
import { useFlexPass } from '../hooks/useFlexPass'
import { Provider } from '../types'

export function AdminConsole() {
  const { providers, isLoading } = useFlexPass()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [newProvider, setNewProvider] = useState({
    name: '',
    logoUrl: '',
    hourlyRate: 1000000 // $1.00 in 6 decimals
  })

  const handleAddProvider = () => {
    // In a real implementation, this would call the smart contract
    console.log('Adding provider:', newProvider)
    setShowAddModal(false)
    setNewProvider({ name: '', logoUrl: '', hourlyRate: 1000000 })
  }

  const handleEditProvider = (provider: Provider) => {
    setEditingProvider(provider)
    setNewProvider({
      name: provider.name,
      logoUrl: provider.logoUrl,
      hourlyRate: provider.hourlyRate
    })
  }

  const handleUpdateProvider = () => {
    if (!editingProvider) return
    // In a real implementation, this would call the smart contract
    console.log('Updating provider:', editingProvider.id, newProvider)
    setEditingProvider(null)
    setNewProvider({ name: '', logoUrl: '', hourlyRate: 1000000 })
  }

  const handleDeleteProvider = (providerId: number) => {
    if (window.confirm('Are you sure you want to delete this provider?')) {
      // In a real implementation, this would call the smart contract
      console.log('Deleting provider:', providerId)
    }
  }

  const handleWithdraw = () => {
    if (window.confirm('Withdraw all collected USDC to your wallet?')) {
      // In a real implementation, this would call the smart contract withdraw function
      console.log('Withdrawing funds')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Console</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage providers, rates, and platform settings
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Providers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {providers.filter(p => p.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                $0.00
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Passes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4"
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Provider
        </button>
        
        <button
          onClick={handleWithdraw}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-medium transition-all shadow-lg flex items-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Withdraw Funds
        </button>
      </motion.div>

      {/* Providers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Providers</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Hourly Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {providers.map((provider) => (
                <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={provider.logoUrl}
                        alt={provider.name}
                        className="w-10 h-10 rounded-lg object-contain bg-gray-100 dark:bg-gray-600 p-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://ui-avatars.com/api/?name=${provider.name}&background=random`
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {provider.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {provider.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-gray-900 dark:text-white font-medium">
                      ${(provider.hourlyRate / 1e6).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      per hour
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      provider.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {provider.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditProvider(provider)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProvider(provider.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add/Edit Provider Modal */}
      {(showAddModal || editingProvider) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {editingProvider ? 'Edit Provider' : 'Add New Provider'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={newProvider.name}
                  onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., ChatGPT"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={newProvider.logoUrl}
                  onChange={(e) => setNewProvider({ ...newProvider, logoUrl: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hourly Rate (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={(newProvider.hourlyRate / 1e6).toFixed(2)}
                  onChange={(e) => setNewProvider({ 
                    ...newProvider, 
                    hourlyRate: Math.round(parseFloat(e.target.value) * 1e6) 
                  })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1.00"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingProvider(null)
                  setNewProvider({ name: '', logoUrl: '', hourlyRate: 1000000 })
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingProvider ? handleUpdateProvider : handleAddProvider}
                disabled={!newProvider.name || !newProvider.logoUrl}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg transition-colors"
              >
                {editingProvider ? 'Update' : 'Add'} Provider
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

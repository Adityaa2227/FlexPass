import { useState } from 'react'

// Pure mock implementation - no blockchain dependencies
export function useContract() {
  const [loading, setLoading] = useState(false)

  // Helper function to get service duration in seconds
  const getServiceDuration = (serviceType: number) => {
    const durations = [
      24 * 60 * 60, // OpenAI: 24 hours
      1 * 60 * 60,  // Spotify: 1 hour  
      3 * 60 * 60   // Netflix: 3 hours
    ]
    return durations[serviceType] || 3600
  }

  const purchasePass = async (serviceType: number) => {
    try {
      setLoading(true)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock token ID and transaction hash
      const tokenId = Date.now() + Math.floor(Math.random() * 1000)
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`
      
      // Create pass data
      const passData = {
        tokenId,
        serviceType,
        expirationTime: Math.floor(Date.now() / 1000) + getServiceDuration(serviceType),
        price: ['0.001', '0.0005', '0.002'][serviceType] || '0.001',
        isActive: true,
        isValid: true,
        transactionHash
      }
      
      // Store in localStorage
      const existingPasses = JSON.parse(localStorage.getItem('userPasses') || '[]')
      existingPasses.push(passData)
      localStorage.setItem('userPasses', JSON.stringify(existingPasses))
      
      return { tokenId, transactionHash }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      throw new Error(error.message || 'Failed to purchase pass')
    } finally {
      setLoading(false)
    }
  }

  const getUserPasses = async (userAddress: string) => {
    try {
      // Get passes from localStorage
      const existingPasses = JSON.parse(localStorage.getItem('userPasses') || '[]')
      return existingPasses.map((pass: any) => pass.tokenId)
    } catch (error) {
      console.error('Failed to get user passes:', error)
      return []
    }
  }

  const getPassDetails = async (tokenId: number) => {
    try {
      // Get pass from localStorage
      const existingPasses = JSON.parse(localStorage.getItem('userPasses') || '[]')
      const pass = existingPasses.find((p: any) => p.tokenId === tokenId)
      
      if (pass) {
        const now = Math.floor(Date.now() / 1000)
        const isValid = pass.expirationTime > now
        return {
          ...pass,
          isValid,
          isActive: isValid
        }
      }
      
      throw new Error('Pass not found')
    } catch (error) {
      console.error('Failed to get pass details:', error)
      throw error
    }
  }

  const isPassValid = async (tokenId: number) => {
    try {
      const details = await getPassDetails(tokenId)
      return details.isValid
    } catch (error) {
      console.error('Failed to check pass validity:', error)
      return false
    }
  }

  const getServicePrice = async (serviceType: number) => {
    // Return mock prices without blockchain call
    const prices = ['0.001', '0.0005', '0.002']
    return Promise.resolve(prices[serviceType] || '0')
  }

  return {
    purchasePass,
    getUserPasses,
    getPassDetails,
    isPassValid,
    getServicePrice,
    loading
  }
}

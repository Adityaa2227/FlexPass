import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useCDPWallet } from './useCDPWallet'
import { Provider, Pass, CONTRACT_ADDRESSES, MOCK_PROVIDERS } from '../types'
import toast from 'react-hot-toast'

const FLEX_PASS_ABI = [
  "function buyPass(uint256 _providerId, uint256 _durationSeconds) external returns (uint256)",
  "function isValid(uint256 _tokenId) external view returns (bool)",
  "function activePassByProvider(address _user, uint256 _providerId) external view returns (uint256)",
  "function extendPass(uint256 _tokenId, uint256 _additionalSeconds) external",
  "function revokePass(uint256 _tokenId) external",
  "function getPassDetails(uint256 _tokenId) external view returns (uint256 providerId, uint256 expirationTime, uint256 pricePaid, bool isActive, bool isValid, string memory transactionHash)",
  "function getUserPasses(address _user) external view returns (uint256[] memory)",
  "function getProvider(uint256 _providerId) external view returns (string memory name, string memory logoUrl, uint256 hourlyRate, bool isActive)",
  "function getAllProviders() external view returns (uint256[] memory)",
  "function addProvider(string memory _name, string memory _logoUrl, uint256 _hourlyRate) external",
  "function updateProvider(uint256 _providerId, string memory _name, string memory _logoUrl, uint256 _hourlyRate) external",
  "function withdraw() external",
  "event PassPurchased(address indexed user, uint256 indexed tokenId, uint256 indexed providerId, uint256 expirationTime, uint256 price)",
  "event PassExtended(uint256 indexed tokenId, uint256 newExpirationTime)",
  "event PassRevoked(uint256 indexed tokenId)"
]

const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
]

export function useFlexPass() {
  const { address, signer } = useCDPWallet()
  const [providers, setProviders] = useState<Provider[]>([])
  const [userPasses, setUserPasses] = useState<Pass[]>([])
  const [usdcBalance, setUsdcBalance] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)

  const flexPassContract = signer ? new ethers.Contract(CONTRACT_ADDRESSES.flexPass, FLEX_PASS_ABI, signer) : null
  const usdcContract = signer ? new ethers.Contract(CONTRACT_ADDRESSES.usdc, USDC_ABI, signer) : null

  const fetchProviders = async () => {
    if (!flexPassContract) {
      // Load providers from localStorage or use mock data
      const savedProviders = localStorage.getItem('flexpass_providers')
      if (savedProviders) {
        setProviders(JSON.parse(savedProviders))
      } else {
        setProviders(MOCK_PROVIDERS)
        localStorage.setItem('flexpass_providers', JSON.stringify(MOCK_PROVIDERS))
      }
      return
    }

    try {
      // Check if contract exists by calling a simple view function
      const providerIds = await flexPassContract.getAllProviders()
      const providersData = await Promise.all(
        providerIds.map(async (id: number) => {
          const [name, logoUrl, hourlyRate, isActive] = await flexPassContract.getProvider(id)
          return {
            id: Number(id),
            name,
            logoUrl,
            hourlyRate: Number(hourlyRate),
            isActive
          }
        })
      )
      setProviders(providersData)
    } catch (error) {
      console.error('Contract not deployed or error fetching providers, using localStorage data:', error)
      // Use localStorage data as fallback
      const savedProviders = localStorage.getItem('flexpass_providers')
      if (savedProviders) {
        setProviders(JSON.parse(savedProviders))
      } else {
        setProviders(MOCK_PROVIDERS)
        localStorage.setItem('flexpass_providers', JSON.stringify(MOCK_PROVIDERS))
      }
    }
  }

  const fetchUserPasses = async () => {
    if (!address) {
      setUserPasses([])
      return
    }

    if (!flexPassContract) {
      // Load passes from localStorage when contract is not available
      const savedPasses = localStorage.getItem(`flexpass_passes_${address}`)
      if (savedPasses) {
        setUserPasses(JSON.parse(savedPasses))
      } else {
        setUserPasses([])
      }
      return
    }

    try {
      const tokenIds = await flexPassContract.getUserPasses(address)
      const passesData = await Promise.all(
        tokenIds.map(async (tokenId: number) => {
          const [providerId, expirationTime, pricePaid, isActive, isValid, transactionHash] = 
            await flexPassContract.getPassDetails(tokenId)
          
          const [name, logoUrl, hourlyRate, providerActive] = await flexPassContract.getProvider(providerId)
          
          return {
            tokenId: Number(tokenId),
            providerId: Number(providerId),
            provider: {
              id: Number(providerId),
              name,
              logoUrl,
              hourlyRate: Number(hourlyRate),
              isActive: providerActive
            },
            expirationTime: Number(expirationTime),
            pricePaid: Number(pricePaid),
            isActive,
            isValid,
            transactionHash,
            owner: address
          }
        })
      )
      setUserPasses(passesData)
    } catch (error) {
      console.error('Contract not deployed or error fetching passes, using localStorage data:', error)
      // Use localStorage data as fallback
      const savedPasses = localStorage.getItem(`flexpass_passes_${address}`)
      if (savedPasses) {
        setUserPasses(JSON.parse(savedPasses))
      } else {
        setUserPasses([])
      }
    }
  }

  const fetchUsdcBalance = async () => {
    if (!usdcContract || !address) {
      setUsdcBalance(0)
      return
    }

    try {
      const balance = await usdcContract.balanceOf(address)
      setUsdcBalance(Number(balance) / 1e6) // Convert from 6 decimals
    } catch (error) {
      console.error('Error fetching USDC balance, setting to 0:', error)
      setUsdcBalance(0)
    }
  }

  const buyPass = async (providerId: number, durationSeconds: number) => {
    if (!address) {
      toast.error('Wallet not connected')
      return null
    }

    setIsLoading(true)
    try {
      const provider = providers.find(p => p.id === providerId)
      if (!provider) {
        toast.error('Provider not found')
        return null
      }

      const durationHours = Math.ceil(durationSeconds / 3600)
      const totalPrice = provider.hourlyRate * durationHours

      if (!flexPassContract || !usdcContract) {
        // Simulate pass purchase when contract is not available
        toast.loading('Purchasing pass...')
        
        // Simulate transaction delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Create mock pass
        const newPass: Pass = {
          tokenId: Date.now(), // Use timestamp as unique ID
          providerId,
          provider,
          expirationTime: Date.now() + (durationSeconds * 1000),
          pricePaid: totalPrice,
          isActive: true,
          isValid: true,
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          owner: address
        }
        
        // Save to localStorage
        const savedPasses = localStorage.getItem(`flexpass_passes_${address}`)
        const currentPasses = savedPasses ? JSON.parse(savedPasses) : []
        const updatedPasses = [...currentPasses, newPass]
        localStorage.setItem(`flexpass_passes_${address}`, JSON.stringify(updatedPasses))
        
        // Update state
        setUserPasses(updatedPasses)
        
        toast.dismiss()
        toast.success('Pass purchased successfully!')
        
        return newPass.transactionHash
      }

      // Smart contract flow
      // Check allowance
      const allowance = await usdcContract.allowance(address, CONTRACT_ADDRESSES.flexPass)
      if (Number(allowance) < totalPrice) {
        toast.loading('Approving USDC...')
        const approveTx = await usdcContract.approve(CONTRACT_ADDRESSES.flexPass, totalPrice)
        await approveTx.wait()
        toast.dismiss()
        toast.success('USDC approved!')
      }

      toast.loading('Purchasing pass...')
      const tx = await flexPassContract.buyPass(providerId, durationSeconds)
      const receipt = await tx.wait()
      
      toast.dismiss()
      toast.success('Pass purchased successfully!')
      
      // Refresh data
      await Promise.all([fetchUserPasses(), fetchUsdcBalance()])
      
      return receipt.transactionHash
    } catch (error: any) {
      console.error('Error buying pass:', error)
      toast.error(error.message || 'Failed to purchase pass')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  const extendPass = async (tokenId: number, additionalSeconds: number) => {
    if (!flexPassContract || !usdcContract) {
      toast.error('Wallet not connected')
      return false
    }

    setIsLoading(true)
    try {
      const pass = userPasses.find(p => p.tokenId === tokenId)
      if (!pass) {
        toast.error('Pass not found')
        return false
      }

      const additionalHours = Math.ceil(additionalSeconds / 3600)
      const extensionPrice = pass.provider.hourlyRate * additionalHours

      // Check allowance
      const allowance = await usdcContract.allowance(address!, CONTRACT_ADDRESSES.flexPass)
      if (Number(allowance) < extensionPrice) {
        toast.loading('Approving USDC...')
        const approveTx = await usdcContract.approve(CONTRACT_ADDRESSES.flexPass, extensionPrice)
        await approveTx.wait()
        toast.dismiss()
      }

      toast.loading('Extending pass...')
      const tx = await flexPassContract.extendPass(tokenId, additionalSeconds)
      await tx.wait()
      
      toast.dismiss()
      toast.success('Pass extended successfully!')
      
      await fetchUserPasses()
      return true
    } catch (error: any) {
      console.error('Error extending pass:', error)
      toast.error(error.message || 'Failed to extend pass')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const revokePass = async (tokenId: number) => {
    if (!flexPassContract) {
      toast.error('Wallet not connected')
      return false
    }

    setIsLoading(true)
    try {
      toast.loading('Revoking pass...')
      const tx = await flexPassContract.revokePass(tokenId)
      await tx.wait()
      
      toast.dismiss()
      toast.success('Pass revoked successfully!')
      
      await fetchUserPasses()
      return true
    } catch (error: any) {
      console.error('Error revoking pass:', error)
      toast.error(error.message || 'Failed to revoke pass')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize demo passes for testing
  const initializeDemoPasses = () => {
    if (!address) return
    
    const demoPassesKey = `flexpass_passes_${address}`
    const existingPasses = localStorage.getItem(demoPassesKey)
    
    if (!existingPasses) {
      const demoPasses: Pass[] = [
        {
          tokenId: 1001,
          providerId: 1,
          provider: {
            id: 1,
            name: 'ChatGPT',
            logoUrl: 'https://cdn.openai.com/API/logo-openai.svg',
            hourlyRate: 1000000,
            isActive: true
          },
          expirationTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
          pricePaid: 24000000, // $24.00 for 24 hours
          isActive: true,
          isValid: true,
          transactionHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
          owner: address
        },
        {
          tokenId: 1002,
          providerId: 2,
          provider: {
            id: 2,
            name: 'Spotify',
            logoUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png',
            hourlyRate: 500000,
            isActive: true
          },
          expirationTime: Date.now() + (12 * 60 * 60 * 1000), // 12 hours from now
          pricePaid: 6000000, // $6.00 for 12 hours
          isActive: true,
          isValid: true,
          transactionHash: '0xf1e2d3c4b5a6789012345678901234567890fedcba1234567890fedcba123456',
          owner: address
        }
      ]
      
      localStorage.setItem(demoPassesKey, JSON.stringify(demoPasses))
      setUserPasses(demoPasses)
    }
  }

  useEffect(() => {
    fetchProviders()
    if (address) {
      initializeDemoPasses()
      fetchUserPasses()
      fetchUsdcBalance()
    }
  }, [signer, address])

  const addProvider = async (providerData: { name: string; logoUrl: string; hourlyRate: number }) => {
    if (!flexPassContract) {
      // Add to localStorage when contract is not available
      const savedProviders = localStorage.getItem('flexpass_providers')
      const currentProviders = savedProviders ? JSON.parse(savedProviders) : MOCK_PROVIDERS
      
      const newProvider: Provider = {
        id: Math.max(...currentProviders.map((p: Provider) => p.id), 0) + 1,
        name: providerData.name,
        logoUrl: providerData.logoUrl,
        hourlyRate: providerData.hourlyRate,
        isActive: true
      }
      
      const updatedProviders = [...currentProviders, newProvider]
      localStorage.setItem('flexpass_providers', JSON.stringify(updatedProviders))
      setProviders(updatedProviders)
      return true
    }
    
    try {
      // Call smart contract addProvider function
      const tx = await flexPassContract.addProvider(
        providerData.name,
        providerData.logoUrl,
        providerData.hourlyRate
      )
      await tx.wait()
      await fetchProviders()
      return true
    } catch (error) {
      console.error('Error adding provider:', error)
      return false
    }
  }

  const updateProvider = async (providerId: number, providerData: { name: string; logoUrl: string; hourlyRate: number }) => {
    if (!flexPassContract) {
      // Update in localStorage when contract is not available
      const savedProviders = localStorage.getItem('flexpass_providers')
      const currentProviders = savedProviders ? JSON.parse(savedProviders) : MOCK_PROVIDERS
      
      const updatedProviders = currentProviders.map((p: Provider) => 
        p.id === providerId 
          ? { ...p, name: providerData.name, logoUrl: providerData.logoUrl, hourlyRate: providerData.hourlyRate }
          : p
      )
      
      localStorage.setItem('flexpass_providers', JSON.stringify(updatedProviders))
      setProviders(updatedProviders)
      return true
    }
    
    try {
      // Call smart contract updateProvider function
      const tx = await flexPassContract.updateProvider(
        providerId,
        providerData.name,
        providerData.logoUrl,
        providerData.hourlyRate
      )
      await tx.wait()
      await fetchProviders()
      return true
    } catch (error) {
      console.error('Error updating provider:', error)
      return false
    }
  }

  const deleteProvider = async (providerId: number) => {
    if (!flexPassContract) {
      // Remove from localStorage when contract is not available
      const savedProviders = localStorage.getItem('flexpass_providers')
      const currentProviders = savedProviders ? JSON.parse(savedProviders) : MOCK_PROVIDERS
      
      const updatedProviders = currentProviders.filter((p: Provider) => p.id !== providerId)
      
      localStorage.setItem('flexpass_providers', JSON.stringify(updatedProviders))
      setProviders(updatedProviders)
      return true
    }
    
    try {
      // Call smart contract function to deactivate provider
      const provider = providers.find(p => p.id === providerId)
      if (provider) {
        const tx = await flexPassContract.updateProvider(
          providerId,
          provider.name,
          provider.logoUrl,
          provider.hourlyRate
        )
        await tx.wait()
        await fetchProviders()
      }
      return true
    } catch (error) {
      console.error('Error deleting provider:', error)
      return false
    }
  }

  return {
    providers,
    userPasses,
    usdcBalance,
    isLoading,
    buyPass,
    extendPass,
    revokePass,
    addProvider,
    updateProvider,
    deleteProvider,
    refreshData: () => Promise.all([fetchProviders(), fetchUserPasses(), fetchUsdcBalance()])
  }
}

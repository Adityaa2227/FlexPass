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
      // Use mock data when contract is not available
      setProviders(MOCK_PROVIDERS)
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
      console.error('Contract not deployed or error fetching providers, using mock data:', error)
      // Use mock data as fallback
      setProviders(MOCK_PROVIDERS)
    }
  }

  const fetchUserPasses = async () => {
    if (!flexPassContract || !address) {
      // Return empty array when no contract or address
      setUserPasses([])
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
      console.error('Contract not deployed or error fetching passes, using empty state:', error)
      // Set empty array as fallback instead of showing error
      setUserPasses([])
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
    if (!flexPassContract || !usdcContract || !address) {
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

  useEffect(() => {
    if (signer && address) {
      fetchProviders()
      fetchUserPasses()
      fetchUsdcBalance()
    }
  }, [signer, address])

  return {
    providers,
    userPasses,
    usdcBalance,
    isLoading,
    buyPass,
    extendPass,
    revokePass,
    refreshData: () => Promise.all([fetchProviders(), fetchUserPasses(), fetchUsdcBalance()])
  }
}

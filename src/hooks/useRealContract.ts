// This file has been deprecated - use useFlexPass instead
export function useRealContract() {
  throw new Error('useRealContract is deprecated. Please use useFlexPass instead.')
}

import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { useCDPWallet } from './useCDPWallet'
import { BLOCKCHAIN_CONFIG, SERVICES } from '../config/blockchain'

// Contract ABI for the deployed smart contract
const CONTRACT_ABI = [
  "function purchasePass(uint8 _serviceType) external payable returns (uint256)",
  "function isPassValid(uint256 _tokenId) external view returns (bool)",
  "function getPassDetails(uint256 _tokenId) external view returns (uint8 serviceType, uint256 expirationTime, uint256 price, bool isActive, bool isValid)",
  "function getUserPasses(address _user) external view returns (uint256[] memory)",
  "function getServicePrice(uint8 _serviceType) external view returns (uint256)",
  "function getServiceDuration(uint8 _serviceType) external view returns (uint256)",
  "event PassPurchased(address indexed user, uint256 indexed tokenId, uint8 serviceType, uint256 expirationTime)"
]

const getContract = useCallback(() => {
  if (!signer || !BLOCKCHAIN_CONFIG.CONTRACTS.MICRO_SUBSCRIPTION_PASS) {
    throw new Error('Contract not deployed or wallet not connected')
  }
  return new ethers.Contract(
    BLOCKCHAIN_CONFIG.CONTRACTS.MICRO_SUBSCRIPTION_PASS,
    CONTRACT_ABI,
    signer
  )
}, [signer])

const getReadOnlyContract = useCallback(() => {
  if (!provider || !BLOCKCHAIN_CONFIG.CONTRACTS.MICRO_SUBSCRIPTION_PASS) {
    throw new Error('Contract not deployed or provider not available')
  }
  return new ethers.Contract(
    BLOCKCHAIN_CONFIG.CONTRACTS.MICRO_SUBSCRIPTION_PASS,
    CONTRACT_ABI,
    provider
  )
}, [provider])

const purchasePass = async (serviceType: number) => {
  try {
    setLoading(true)
    const contract = getContract()
    
    // Get the price for the service type
    const price = await contract.getServicePrice(serviceType)
    
    // Purchase the pass
    const tx = await contract.purchasePass(serviceType, { value: price })
    const receipt = await tx.wait()
    
    // Get the token ID from the event
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log)
        return parsed?.name === 'PassPurchased'
      } catch {
        return false
      }
    })
    
    let tokenId = Date.now()
    if (event) {
      const parsed = contract.interface.parseLog(event)
      tokenId = parsed?.args?.tokenId?.toString() || tokenId
    }
    
    return { tokenId, transactionHash: receipt.hash }
  } catch (error: any) {
    console.error('Purchase failed:', error)
    throw new Error(error.message || 'Failed to purchase pass')
  } finally {
    setLoading(false)
  }
      return service?.price || '0.001'
    }
  }

  return {
    purchasePass,
    getUserPasses,
    getPassDetails,
    isPassValid,
    getServicePrice,
    loading,
    isContractDeployed: !!BLOCKCHAIN_CONFIG.CONTRACTS.MICRO_SUBSCRIPTION_PASS
  }
}

import { useState } from 'react'
import { useCDPWallet } from './useCDPWallet'
import { useRealContract } from './useRealContract'

interface X402RequestParams {
  service: string
  tokenId: number
  endpoint: string
  method: string
  headers?: Record<string, string>
  body?: string
}

interface X402Response {
  success: boolean
  data?: string
  error?: string
}

export function useX402() {
  const { address, signer } = useCDPWallet()
  const { isPassValid } = useRealContract()
  const [loading, setLoading] = useState(false)

  const generateX402Header = async (tokenId: number, endpoint: string) => {
    if (!signer || !address) throw new Error('Wallet not connected')

    // Verify pass is valid on-chain
    const isValid = await isPassValid(tokenId)
    if (!isValid) throw new Error('Pass is not valid or has expired')

    // Create signature for X402 authentication
    const timestamp = Math.floor(Date.now() / 1000)
    const message = `${address}:${tokenId}:${endpoint}:${timestamp}`
    const signature = await signer.signMessage(message)

    return {
      'X-402-Token-ID': tokenId.toString(),
      'X-402-Address': address,
      'X-402-Timestamp': timestamp.toString(),
      'X-402-Signature': signature,
      'Authorization': `Bearer ${signature}`
    }
  }

  const makeX402Request = async (params: X402RequestParams): Promise<X402Response> => {
    try {
      setLoading(true)

      // Generate X402 authentication headers
      const x402Headers = await generateX402Header(params.tokenId, params.endpoint)

      // Mock API responses for demonstration
      if (params.service === 'openai') {
        return mockOpenAIResponse(params.body)
      } else if (params.service === 'spotify') {
        return mockSpotifyResponse(params.endpoint)
      } else if (params.service === 'netflix') {
        return mockNetflixResponse(params.body)
      }

      // In a real implementation, you would make the actual API call here:
      /*
      const response = await fetch(params.endpoint, {
        method: params.method,
        headers: {
          ...params.headers,
          ...x402Headers
        },
        body: params.body
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.text()
      return { success: true, data }
      */

      return { success: false, error: 'Service not implemented' }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Mock responses for demonstration
  const mockOpenAIResponse = async (body?: string): Promise<X402Response> => {
    await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API delay
    
    try {
      const request = JSON.parse(body || '{}')
      const userMessage = request.messages?.[0]?.content || 'Hello'
      
      const responses = [
        "I'm a mock OpenAI response! Your Web3 pass has been verified and you have access to AI capabilities.",
        "This is a simulated AI response. In a real implementation, this would connect to OpenAI's API using your verified pass.",
        "Your blockchain-verified pass grants you access to AI services. This is a demonstration of Web3-gated content access.",
        `You asked: "${userMessage}". This is a mock response showing that your pass #${Math.floor(Math.random() * 1000)} is valid and working!`
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      return {
        success: true,
        data: JSON.stringify({
          choices: [{
            message: {
              content: randomResponse
            }
          }]
        })
      }
    } catch (error) {
      return { success: false, error: 'Failed to parse request' }
    }
  }

  const mockSpotifyResponse = async (endpoint: string): Promise<X402Response> => {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    
    const mockTracks = [
      {
        id: '1',
        name: 'Bohemian Rhapsody',
        artists: [{ name: 'Queen' }],
        album: {
          name: 'A Night at the Opera',
          images: [
            { url: 'https://via.placeholder.com/640x640/8B5A3C/FFFFFF?text=Queen' },
            { url: 'https://via.placeholder.com/300x300/8B5A3C/FFFFFF?text=Queen' },
            { url: 'https://via.placeholder.com/64x64/8B5A3C/FFFFFF?text=Q' }
          ]
        },
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      },
      {
        id: '2',
        name: 'Imagine',
        artists: [{ name: 'John Lennon' }],
        album: {
          name: 'Imagine',
          images: [
            { url: 'https://via.placeholder.com/640x640/4A90E2/FFFFFF?text=Imagine' },
            { url: 'https://via.placeholder.com/300x300/4A90E2/FFFFFF?text=Imagine' },
            { url: 'https://via.placeholder.com/64x64/4A90E2/FFFFFF?text=I' }
          ]
        },
        preview_url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      }
    ]

    return {
      success: true,
      data: JSON.stringify({
        tracks: {
          items: mockTracks
        }
      })
    }
  }

  const mockNetflixResponse = async (body?: string): Promise<X402Response> => {
    await new Promise(resolve => setTimeout(resolve, 800)) // Simulate API delay
    
    return {
      success: true,
      data: JSON.stringify({
        accessGranted: true,
        message: 'Access granted via blockchain verification'
      })
    }
  }

  return {
    makeX402Request,
    loading
  }
}

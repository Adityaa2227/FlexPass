import { Provider, Pass } from '../types'

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: 1,
    name: 'ChatGPT',
    logoUrl: 'https://cdn.openai.com/API/logo-openai.svg',
    hourlyRate: 1000000, // $1.00
    isActive: true
  },
  {
    id: 2,
    name: 'Spotify',
    logoUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_CMYK_Green.png',
    hourlyRate: 500000, // $0.50
    isActive: true
  },
  {
    id: 3,
    name: 'Netflix',
    logoUrl: 'https://assets.brand.microsites.netflix.io/assets/2800a67c-4252-11ec-a9ce-066b49664af6_cm_800w.jpg',
    hourlyRate: 2000000, // $2.00
    isActive: true
  },
  {
    id: 4,
    name: 'Kindle',
    logoUrl: 'https://m.media-amazon.com/images/G/01/kindle/dp/2017/4911315144/LP_AG_HERO_LOGO_KINDLE._CB514508846_.png',
    hourlyRate: 750000, // $0.75
    isActive: true
  }
]

export const MOCK_PASSES: Pass[] = [
  {
    tokenId: 1,
    providerId: 1,
    provider: MOCK_PROVIDERS[0],
    expirationTime: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    pricePaid: 1000000,
    isActive: true,
    isValid: true,
    transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
    owner: '0x742d35Cc6634C0532925a3b8D4C5f207F2E5d11C'
  },
  {
    tokenId: 2,
    providerId: 2,
    provider: MOCK_PROVIDERS[1],
    expirationTime: Math.floor(Date.now() / 1000) + 7200, // 2 hours from now
    pricePaid: 1000000,
    isActive: true,
    isValid: true,
    transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    owner: '0x742d35Cc6634C0532925a3b8D4C5f207F2E5d11C'
  },
  {
    tokenId: 3,
    providerId: 3,
    provider: MOCK_PROVIDERS[2],
    expirationTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago (expired)
    pricePaid: 2000000,
    isActive: false,
    isValid: false,
    transactionHash: '0x567890abcdef1234567890abcdef1234567890ab',
    owner: '0x742d35Cc6634C0532925a3b8D4C5f207F2E5d11C'
  }
]

// Mock API endpoints for x402 integration
export const API_ENDPOINTS = {
  chatgpt: {
    base: 'https://api.openai.com/v1',
    endpoints: {
      chat: '/chat/completions',
      models: '/models'
    }
  },
  spotify: {
    base: 'https://api.spotify.com/v1',
    endpoints: {
      search: '/search',
      playlists: '/me/playlists',
      player: '/me/player'
    }
  },
  netflix: {
    base: 'https://api.netflix.com/v1',
    endpoints: {
      browse: '/browse',
      watch: '/watch',
      recommendations: '/recommendations'
    }
  },
  kindle: {
    base: 'https://api.amazon.com/kindle/v1',
    endpoints: {
      library: '/library',
      read: '/read',
      sync: '/sync'
    }
  }
}

// Sample API responses for demonstration
export const SAMPLE_API_RESPONSES = {
  chatgpt: {
    chat: {
      id: 'chatcmpl-123',
      object: 'chat.completion',
      created: 1677652288,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: 'Hello! I\'m ChatGPT, and I\'m ready to help you with your questions.'
        },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 9,
        completion_tokens: 12,
        total_tokens: 21
      }
    }
  },
  spotify: {
    search: {
      tracks: {
        href: 'https://api.spotify.com/v1/search?query=tania+bowra&type=track&offset=0&limit=20',
        items: [
          {
            album: {
              name: 'Sample Album',
              images: [{ url: 'https://example.com/album.jpg' }]
            },
            artists: [{ name: 'Sample Artist' }],
            name: 'Sample Track',
            preview_url: 'https://example.com/preview.mp3'
          }
        ]
      }
    }
  },
  netflix: {
    browse: {
      results: [
        {
          id: 'movie123',
          title: 'Sample Movie',
          description: 'A great sample movie for demonstration',
          thumbnail: 'https://example.com/thumbnail.jpg',
          genre: 'Action'
        }
      ]
    }
  },
  kindle: {
    library: {
      books: [
        {
          id: 'book123',
          title: 'Sample Book',
          author: 'Sample Author',
          cover: 'https://example.com/cover.jpg',
          progress: 0.25
        }
      ]
    }
  }
}

import { useState } from 'react'
import { Pass } from '../Dashboard'
import { useX402 } from '../../hooks/useX402'

interface SpotifyAccessProps {
  pass: Pass
}

export function SpotifyAccess({ pass }: SpotifyAccessProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<any>(null)
  const { makeX402Request } = useX402()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      setTracks([])

      const result = await makeX402Request({
        service: 'spotify',
        tokenId: pass.tokenId,
        endpoint: `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (result.success) {
        const data = JSON.parse(result.data || '{}')
        setTracks(data.tracks?.items || [])
      } else {
        console.error('Search failed:', result.error || 'Unknown error')
      }
    } catch (error: any) {
      console.error('Search error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const playTrack = (track: any) => {
    setCurrentTrack(track)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Spotify Music Access</h3>
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          Pass #{pass.tokenId}
        </span>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 mb-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search for music:
          </label>
          <div className="flex space-x-2">
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for songs, artists, albums..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="btn-primary"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </form>

      {tracks.length > 0 && (
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-gray-900">Search Results:</h4>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {track.album?.images?.[2] && (
                    <img
                      src={track.album.images[2].url}
                      alt={track.album.name}
                      className="w-12 h-12 rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{track.name}</p>
                    <p className="text-sm text-gray-600">
                      {track.artists?.map((artist: any) => artist.name).join(', ')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => playTrack(track)}
                  className="btn-secondary text-sm"
                >
                  Play Preview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentTrack && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Now Playing:</h4>
          <div className="flex items-center space-x-3">
            {currentTrack.album?.images?.[1] && (
              <img
                src={currentTrack.album.images[1].url}
                alt={currentTrack.album.name}
                className="w-16 h-16 rounded"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{currentTrack.name}</p>
              <p className="text-sm text-gray-600">
                {currentTrack.artists?.map((artist: any) => artist.name).join(', ')}
              </p>
              <p className="text-xs text-gray-500">{currentTrack.album?.name}</p>
            </div>
          </div>
          {currentTrack.preview_url && (
            <audio
              controls
              src={currentTrack.preview_url}
              className="w-full mt-3"
            >
              Your browser does not support the audio element.
            </audio>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>⚡ Powered by X402 access control</p>
        <p>🔒 Your pass is verified on-chain before each request</p>
      </div>
    </div>
  )
}

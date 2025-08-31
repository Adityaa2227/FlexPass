import { useState } from 'react'
import { Pass } from '../Dashboard'
import { useX402 } from '../../hooks/useX402'

interface NetflixAccessProps {
  pass: Pass
}

interface Movie {
  id: string
  title: string
  description: string
  genre: string
  duration: string
  rating: string
  thumbnail: string
  videoUrl: string
}

export function NetflixAccess({ pass }: NetflixAccessProps) {
  const [movies] = useState<Movie[]>([
    {
      id: '1',
      title: 'The Matrix',
      description: 'A computer programmer discovers that reality as he knows it is a simulation.',
      genre: 'Sci-Fi',
      duration: '136 min',
      rating: 'R',
      thumbnail: 'https://via.placeholder.com/300x450/000000/FFFFFF?text=The+Matrix',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: '2',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through dream-sharing technology.',
      genre: 'Sci-Fi',
      duration: '148 min',
      rating: 'PG-13',
      thumbnail: 'https://via.placeholder.com/300x450/1a1a1a/FFFFFF?text=Inception',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
    },
    {
      id: '3',
      title: 'Interstellar',
      description: 'A team of explorers travel through a wormhole in space.',
      genre: 'Sci-Fi',
      duration: '169 min',
      rating: 'PG-13',
      thumbnail: 'https://via.placeholder.com/300x450/2c3e50/FFFFFF?text=Interstellar',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4'
    }
  ])
  
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const { makeX402Request } = useX402()

  const requestAccess = async (movie: Movie) => {
    try {
      setLoading(true)
      
      const result = await makeX402Request({
        service: 'netflix',
        tokenId: pass.tokenId,
        endpoint: `/api/netflix/access/${movie.id}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movieId: movie.id,
          passTokenId: pass.tokenId
        })
      })

      if (result.success) {
        setSelectedMovie(movie)
        setAccessGranted(true)
      } else {
        console.error('Access denied:', result.error)
      }
    } catch (error: any) {
      console.error('Access request failed:', error.message)
    } finally {
      setLoading(false)
    }
  }

  const closePlayer = () => {
    setSelectedMovie(null)
    setAccessGranted(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Netflix Movie Access</h3>
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
          Pass #{pass.tokenId}
        </span>
      </div>

      {!selectedMovie ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {movies.map((movie) => (
            <div key={movie.id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={movie.thumbnail}
                alt={movie.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{movie.title}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{movie.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                  <span>{movie.genre}</span>
                  <span>{movie.duration}</span>
                  <span>{movie.rating}</span>
                </div>
                <button
                  onClick={() => requestAccess(movie)}
                  disabled={loading}
                  className="btn-primary w-full text-sm"
                >
                  {loading ? 'Requesting Access...' : 'Watch Movie'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">{selectedMovie.title}</h4>
            <button
              onClick={closePlayer}
              className="btn-secondary text-sm"
            >
              Close Player
            </button>
          </div>
          
          {accessGranted && (
            <div className="bg-black rounded-lg overflow-hidden">
              <video
                controls
                className="w-full"
                poster={selectedMovie.thumbnail}
              >
                <source src={selectedMovie.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 mb-2">{selectedMovie.description}</p>
            <div className="flex space-x-4 text-sm text-gray-600">
              <span><strong>Genre:</strong> {selectedMovie.genre}</span>
              <span><strong>Duration:</strong> {selectedMovie.duration}</span>
              <span><strong>Rating:</strong> {selectedMovie.rating}</span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>⚡ Powered by X402 access control</p>
        <p>🔒 Your pass is verified on-chain before each request</p>
      </div>
    </div>
  )
}

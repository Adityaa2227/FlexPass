import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, Download, Star } from 'lucide-react'
import { useFlexPass } from '../../hooks/useFlexPass'

export function SpotifyClone() {
  const { userPasses } = useFlexPass()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState(0)
  const [volume, setVolume] = useState(75)
  const [progress, setProgress] = useState(0)

  // Check if user has active Spotify pass
  const hasSpotifyPass = userPasses.some(pass => 
    pass.provider.name === 'Spotify' && 
    pass.isActive && 
    pass.isValid &&
    pass.expirationTime > Date.now()
  )

  const premiumSongs = [
    { id: 1, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", premium: true },
    { id: 2, title: "Shape of You", artist: "Ed Sheeran", album: "÷ (Divide)", duration: "3:53", premium: true },
    { id: 3, title: "Someone Like You", artist: "Adele", album: "21", duration: "4:45", premium: true },
    { id: 4, title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", premium: true },
    { id: 5, title: "Hotel California", artist: "Eagles", album: "Hotel California", duration: "6:30", premium: true }
  ]

  const freeSongs = [
    { id: 6, title: "Free Song 1", artist: "Demo Artist", album: "Free Album", duration: "2:30", premium: false },
    { id: 7, title: "Free Song 2", artist: "Demo Artist", album: "Free Album", duration: "3:15", premium: false }
  ]

  const availableSongs = hasSpotifyPass ? [...premiumSongs, ...freeSongs] : freeSongs

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const nextSong = () => {
    setCurrentSong((prev) => (prev + 1) % availableSongs.length)
    setProgress(0)
  }

  const prevSong = () => {
    setCurrentSong((prev) => (prev - 1 + availableSongs.length) % availableSongs.length)
    setProgress(0)
  }

  const currentTrack = availableSongs[currentSong]

  if (!hasSpotifyPass) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold">♪</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Spotify Premium Required</h1>
          <p className="text-gray-400 mb-6">You need an active Spotify pass to access premium music features</p>
          <button className="bg-green-500 hover:bg-green-600 text-black font-bold px-8 py-3 rounded-full">
            Get Spotify Pass
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">♪</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Spotify Premium</h1>
              <p className="text-green-100">Powered by FlexPass</p>
            </div>
          </div>
          <div className="bg-green-700 px-4 py-2 rounded-full">
            <span className="text-sm font-medium">✅ Premium Active</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Premium Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8"
        >
          <h2 className="text-xl font-bold mb-4">🎵 Premium Features Unlocked</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              <span>Offline Downloads</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              <span>High Quality Audio</span>
            </div>
            <div className="flex items-center gap-2">
              <Shuffle className="w-5 h-5" />
              <span>Unlimited Skips</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>No Ads</span>
            </div>
          </div>
        </motion.div>

        {/* Music Library */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Playlist */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Premium Playlist</h2>
            <div className="space-y-2">
              {availableSongs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setCurrentSong(index)}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
                    currentSong === index 
                      ? 'bg-green-600 bg-opacity-20 border border-green-500' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                    {currentSong === index && isPlaying ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{song.title}</h3>
                    <p className="text-gray-400 text-sm">{song.artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">{song.duration}</p>
                    {song.premium && (
                      <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full">
                        Premium
                      </span>
                    )}
                  </div>
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Now Playing */}
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-6">Now Playing</h3>
            <div className="text-center mb-6">
              <div className="w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
              <h4 className="text-lg font-bold">{currentTrack.title}</h4>
              <p className="text-gray-400">{currentTrack.artist}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{Math.floor(progress * 0.2)}:{String(Math.floor((progress * 0.2 % 1) * 60)).padStart(2, '0')}</span>
                <span>{currentTrack.duration}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button className="text-gray-400 hover:text-white">
                <Shuffle className="w-5 h-5" />
              </button>
              <button onClick={prevSong} className="text-gray-400 hover:text-white">
                <SkipBack className="w-6 h-6" />
              </button>
              <button 
                onClick={togglePlay}
                className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center"
              >
                {isPlaying ? <Pause className="w-6 h-6 text-black" /> : <Play className="w-6 h-6 text-black" />}
              </button>
              <button onClick={nextSong} className="text-gray-400 hover:text-white">
                <SkipForward className="w-6 h-6" />
              </button>
              <button className="text-gray-400 hover:text-white">
                <Repeat className="w-5 h-5" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm text-gray-400 w-8">{volume}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Music, Play, Pause, SkipForward, Volume2, ExternalLink } from "lucide-react"
import type { ScheduledActivity } from "@/lib/types"

interface Playlist {
  id: string
  name: string
  description: string
  trackCount: number
  duration: string
  thumbnail: string
  embedUrl: string
  spotifyUrl?: string
  youtubeUrl?: string
}

interface MusicIntegrationProps {
  activities: ScheduledActivity[]
  onPlaylistSelect?: (playlist: Playlist) => void
}

export function MusicIntegration({ activities, onPlaylistSelect }: MusicIntegrationProps) {
  const [suggestedPlaylists, setSuggestedPlaylists] = useState<Playlist[]>([])
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)

  // Mock playlist data - in production, you'd integrate with Spotify/YouTube Music APIs
  const playlistDatabase: Record<string, Playlist[]> = {
    "driving": [
      {
        id: "road-trip-hits",
        name: "Road Trip Hits",
        description: "Perfect driving companions for your weekend adventures",
        trackCount: 50,
        duration: "3h 20m",
        thumbnail: "🚗",
        embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX0XUsuxWHRQd",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
        youtubeUrl: "https://music.youtube.com/playlist?list=PLrAl6TvUA7I5RmqgKE5aP-_Iy7tWYc8bI"
      },
      {
        id: "chill-drive",
        name: "Chill Drive",
        description: "Relaxed tunes for scenic routes",
        trackCount: 35,
        duration: "2h 15m", 
        thumbnail: "🌅",
        embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWTvNyxOwkztu",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWTvNyxOwkztu"
      }
    ],
    "relaxing": [
      {
        id: "sunday-chill",
        name: "Sunday Chill",
        description: "Smooth sounds for relaxing evenings",
        trackCount: 40,
        duration: "2h 45m",
        thumbnail: "🌙",
        embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX4sWSpwAYIY1",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwAYIY1"
      },
      {
        id: "meditation-sounds",
        name: "Meditation & Focus",
        description: "Ambient sounds for mindful moments",
        trackCount: 25,
        duration: "1h 50m",
        thumbnail: "🧘",
        embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u"
      }
    ],
    "workout": [
      {
        id: "energy-boost",
        name: "Energy Boost",
        description: "High-energy tracks to power your workout",
        trackCount: 60,
        duration: "4h 10m",
        thumbnail: "💪",
        embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP"
      }
    ],
    "cooking": [
      {
        id: "kitchen-vibes",
        name: "Kitchen Vibes",
        description: "Upbeat music for cooking adventures",
        trackCount: 45,
        duration: "3h 5m",
        thumbnail: "👨‍🍳",
        embedUrl: "https://open.spotify.com/embed/playlist/37i9dQZF1DWTcqUzwhNmKv",
        spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DWTcqUzwhNmKv"
      }
    ]
  }

  useEffect(() => {
    const getMusicSuggestions = () => {
      const musicActivities = activities.filter(activity => {
        const musicKeywords = [
          "long-drive", "driving", "road-trip", "car",
          "relaxing", "chill", "evening", "reading", "spa",
          "workout", "exercise", "gym", "fitness",
          "cooking", "kitchen", "dinner", "brunch"
        ]
        
        return musicKeywords.some(keyword => 
          activity.name.toLowerCase().includes(keyword) ||
          activity.description?.toLowerCase().includes(keyword) ||
          activity.id.includes(keyword)
        )
      })

      if (musicActivities.length === 0) return []

      const suggestions: Playlist[] = []
      
      musicActivities.forEach(activity => {
        const activityType = getActivityType(activity)
        const playlists = playlistDatabase[activityType] || []
        playlists.forEach(playlist => {
          if (!suggestions.some(s => s.id === playlist.id)) {
            suggestions.push(playlist)
          }
        })
      })

      return suggestions
    }

    setSuggestedPlaylists(getMusicSuggestions())
  }, [activities])

  const getActivityType = (activity: ScheduledActivity): string => {
    if (["long-drive", "car", "driving"].some(keyword => 
      activity.name.toLowerCase().includes(keyword) || activity.id.includes(keyword)
    )) {
      return "driving"
    }
    
    if (["workout", "exercise", "gym", "fitness", "cycling", "hiking"].some(keyword =>
      activity.name.toLowerCase().includes(keyword) || activity.id.includes(keyword)
    )) {
      return "workout"
    }
    
    if (["cooking", "kitchen", "brunch", "dinner"].some(keyword =>
      activity.name.toLowerCase().includes(keyword) || activity.id.includes(keyword)
    )) {
      return "cooking"
    }
    
    return "relaxing"
  }

  const handlePlaylistSelect = (playlist: Playlist) => {
    setCurrentPlaylist(playlist)
    setShowPlayer(true)
    setIsPlaying(true)
    onPlaylistSelect?.(playlist)
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
  }

  if (suggestedPlaylists.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-500" />
            Music Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Add activities like "Long Drive" or "Relaxing Evening" to get music suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-500" />
            Music for Your Activities
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Curated playlists to enhance your weekend experience
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {suggestedPlaylists.map((playlist, index) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border border-purple-200/50 hover:border-purple-300 transition-colors overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-2xl mr-4 shadow-lg">
                      {playlist.thumbnail}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">{playlist.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                        {playlist.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{playlist.trackCount} tracks</span>
                        <span>{playlist.duration}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          onClick={() => handlePlaylistSelect(playlist)}
                          className="h-10 w-10 p-0"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </motion.div>
                      
                      {playlist.spotifyUrl && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(playlist.spotifyUrl, '_blank')}
                            className="h-10 w-10 p-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Music Player */}
      <AnimatePresence>
        {showPlayer && currentPlaylist && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="w-80 bg-white/95 backdrop-blur-lg shadow-2xl border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center text-xl">
                      {currentPlaylist.thumbnail}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm truncate">{currentPlaylist.name}</h4>
                      <p className="text-xs text-muted-foreground">Now Playing</p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPlayer(false)}
                    className="h-8 w-8 p-0"
                  >
                    <motion.div
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      ✕
                    </motion.div>
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-4 mb-4">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button size="sm" variant="ghost" className="h-10 w-10 p-0">
                      <SkipForward className="w-4 h-4 rotate-180" />
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      size="sm"
                      onClick={togglePlayback}
                      className="h-12 w-12 p-0 rounded-full"
                    >
                      {isPlaying ? 
                        <Pause className="w-6 h-6" /> : 
                        <Play className="w-6 h-6" />
                      }
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button size="sm" variant="ghost" className="h-10 w-10 p-0">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                      initial={{ width: "0%" }}
                      animate={{ width: isPlaying ? "45%" : "45%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(currentPlaylist.spotifyUrl, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Spotify
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Plus, Clock, MapPin, Users } from "lucide-react"
import type { Activity, ScheduledActivity } from "@/lib/types"
import { PREDEFINED_ACTIVITIES } from "@/lib/activities-data"

interface SmartSuggestion {
  activity: Activity
  reason: string
  confidence: number
  category: "complementary" | "time-based" | "mood-based" | "location-based"
  icon: string
}

interface SmartSuggestionsProps {
  currentActivities: ScheduledActivity[]
  onAddActivity: (activity: Activity) => void
  userPreferences?: {
    favoriteCategories?: string[]
    preferredTimes?: string[]
    mood?: string
  }
}

export function SmartSuggestions({ 
  currentActivities, 
  onAddActivity,
  userPreferences = {}
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateSuggestions = () => {
      const suggestions: SmartSuggestion[] = []
      
      // Get current activity categories and times
      const currentCategories = currentActivities.map(a => a.category)
      const currentMoods = currentActivities.map(a => a.mood).filter(Boolean)
      const busyTimes = currentActivities.map(a => ({ start: a.startTime, end: a.endTime }))
      
      // Rule 1: Complementary activities
      const complementaryRules = {
        "hiking": ["picnic", "meditation", "spa-day"],
        "workout": ["spa-day", "meditation", "healthy-cooking"],
        "cooking": ["friends-hangout", "family-time", "restaurant"],
        "movie-night": ["cooking", "reading", "art-crafts"],
        "shopping": ["brunch", "restaurant", "friends-hangout"],
        "art-crafts": ["museum", "reading", "cooking"],
        "gaming": ["friends-hangout", "party", "movie-night"]
      }

      currentActivities.forEach(activity => {
        const complementary = complementaryRules[activity.id as keyof typeof complementaryRules]
        if (complementary) {
          complementary.forEach(compId => {
            const compActivity = PREDEFINED_ACTIVITIES.find(a => a.id === compId)
            if (compActivity && !currentActivities.some(ca => ca.id === compId)) {
              suggestions.push({
                activity: compActivity,
                reason: `Perfect complement to ${activity.name}`,
                confidence: 0.9,
                category: "complementary",
                icon: "🎯"
              })
            }
          })
        }
      })

      // Rule 2: Time-based suggestions
      const morningActivities = ["yoga", "workout", "hiking", "brunch"]
      const afternoonActivities = ["shopping", "museum", "picnic", "cycling"]
      const eveningActivities = ["movie-night", "restaurant", "cooking", "reading"]

      const getMissingTimeSlots = () => {
        const timeSlots = ["09:00", "12:00", "15:00", "18:00", "21:00"]
        return timeSlots.filter(time => 
          !busyTimes.some(busy => time >= busy.start && time <= busy.end)
        )
      }

      getMissingTimeSlots().forEach(time => {
        let timeActivities: string[] = []
        const hour = parseInt(time.split(":")[0])
        
        if (hour < 12) timeActivities = morningActivities
        else if (hour < 18) timeActivities = afternoonActivities
        else timeActivities = eveningActivities

        const suggestion = timeActivities.find(actId => 
          !currentActivities.some(ca => ca.id === actId)
        )
        
        if (suggestion) {
          const activity = PREDEFINED_ACTIVITIES.find(a => a.id === suggestion)
          if (activity) {
            suggestions.push({
              activity,
              reason: `Perfect for ${hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'} slot`,
              confidence: 0.8,
              category: "time-based",
              icon: "⏰"
            })
          }
        }
      })

      // Rule 3: Mood-based suggestions
      const moodActivities = {
        "energetic": ["hiking", "cycling", "workout", "party", "concert"],
        "relaxed": ["reading", "spa-day", "meditation", "movie-night"],
        "happy": ["friends-hangout", "cooking", "art-crafts", "shopping"],
        "adventurous": ["hiking", "museum", "food-market", "cycling"]
      }

      if (currentMoods.length > 0) {
        const dominantMood = currentMoods[0] // Simplified - could be more sophisticated
        const moodSuggestions = moodActivities[dominantMood as keyof typeof moodActivities] || []
        
        moodSuggestions.forEach(actId => {
          if (!currentActivities.some(ca => ca.id === actId)) {
            const activity = PREDEFINED_ACTIVITIES.find(a => a.id === actId)
            if (activity && !suggestions.some(s => s.activity.id === actId)) {
              suggestions.push({
                activity,
                reason: `Matches your ${dominantMood} mood`,
                confidence: 0.7,
                category: "mood-based",
                icon: "😊"
              })
            }
          }
        })
      }

      // Rule 4: Balance suggestions
      const categoryBalance = {
        outdoor: currentCategories.filter(c => c === "outdoor").length,
        indoor: currentCategories.filter(c => c === "indoor").length,
        social: currentCategories.filter(c => c === "social").length,
        wellness: currentCategories.filter(c => c === "wellness").length
      }

      const underrepresentedCategory = Object.entries(categoryBalance)
        .sort(([,a], [,b]) => a - b)[0][0]

      const balanceActivity = PREDEFINED_ACTIVITIES.find(a => 
        a.category === underrepresentedCategory && 
        !currentActivities.some(ca => ca.id === a.id)
      )

      if (balanceActivity) {
        suggestions.push({
          activity: balanceActivity,
          reason: `Balance your weekend with more ${underrepresentedCategory} activities`,
          confidence: 0.6,
          category: "mood-based",
          icon: "⚖️"
        })
      }

      // Sort by confidence and remove duplicates
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.activity.id === suggestion.activity.id)
        )
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 4)

      return uniqueSuggestions
    }

    // Simulate AI processing time
    const timer = setTimeout(() => {
      setSuggestions(generateSuggestions())
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [currentActivities])

  const getCategoryIcon = (category: SmartSuggestion["category"]) => {
    const icons = {
      "complementary": "🎯",
      "time-based": "⏰", 
      "mood-based": "😊",
      "location-based": "📍"
    }
    return icons[category]
  }

  const getCategoryColor = (category: SmartSuggestion["category"]) => {
    const colors = {
      "complementary": "bg-green-100 text-green-800",
      "time-based": "bg-blue-100 text-blue-800",
      "mood-based": "bg-purple-100 text-purple-800",
      "location-based": "bg-orange-100 text-orange-800"
    }
    return colors[category]
  }

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
            </motion.div>
            AI Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="h-20 bg-gray-100 rounded-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Analyzing your activities to find perfect recommendations...
          </p>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-purple-500" />
            AI Smart Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            </motion.div>
            <p className="text-sm text-muted-foreground">
              Add some activities to get personalized suggestions!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Smart Suggestions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized recommendations based on your current plan
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border border-purple-200/50 hover:border-purple-300 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{suggestion.activity.icon}</div>
                    <div>
                      <h4 className="font-medium text-sm">{suggestion.activity.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getCategoryColor(suggestion.category)}`}
                        >
                          {suggestion.icon} {suggestion.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {suggestion.activity.duration}min
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="sm"
                      onClick={() => onAddActivity(suggestion.activity)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {suggestion.reason}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">Confidence:</div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < suggestion.confidence * 5 
                                ? "bg-green-400" 
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                    
                    {suggestion.activity.description && (
                      <Badge variant="outline" className="text-xs">
                        {suggestion.activity.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

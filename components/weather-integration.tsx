"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Thermometer } from "lucide-react"
import type { ScheduledActivity } from "@/lib/types"

interface WeatherData {
  temperature: number
  condition: "sunny" | "cloudy" | "rainy" | "snowy" | "windy"
  description: string
  humidity: number
  windSpeed: number
}

interface WeatherIntegrationProps {
  activities: ScheduledActivity[]
  onWeatherUpdate?: (weather: WeatherData[]) => void
}

export function WeatherIntegration({ activities, onWeatherUpdate }: WeatherIntegrationProps) {
  const [weather, setWeather] = useState<WeatherData[]>([])
  const [loading, setLoading] = useState(true)

  // Mock weather data - in production, you'd call OpenWeather API
  const generateMockWeather = (): WeatherData[] => {
    const conditions: WeatherData["condition"][] = ["sunny", "cloudy", "rainy", "snowy", "windy"]
    const descriptions = {
      sunny: "Clear skies",
      cloudy: "Partly cloudy",
      rainy: "Light rain",
      snowy: "Light snow",
      windy: "Windy conditions"
    }

    return Array.from({ length: 2 }, (_, index) => {
      const condition = conditions[Math.floor(Math.random() * conditions.length)]
      return {
        temperature: Math.floor(Math.random() * 30) + 10,
        condition,
        description: descriptions[condition],
        humidity: Math.floor(Math.random() * 50) + 30,
        windSpeed: Math.floor(Math.random() * 20) + 5
      }
    })
  }

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      const mockWeather = generateMockWeather()
      setWeather(mockWeather)
      setLoading(false)
      onWeatherUpdate?.(mockWeather)
    }, 1000)

    return () => clearTimeout(timer)
  }, [onWeatherUpdate])

  const getOutdoorActivities = () => {
    return activities.filter(activity => 
      activity.category === "outdoor" || 
      ["hiking", "cycling", "picnic", "gardening"].includes(activity.id)
    )
  }

  const getWeatherIcon = (condition: WeatherData["condition"]) => {
    const icons = {
      sunny: Sun,
      cloudy: Cloud,
      rainy: CloudRain,
      snowy: CloudSnow,
      windy: Wind
    }
    return icons[condition] || Sun
  }

  const getWeatherColor = (condition: WeatherData["condition"]) => {
    const colors = {
      sunny: "from-yellow-400 to-orange-400",
      cloudy: "from-gray-400 to-blue-400",
      rainy: "from-blue-400 to-indigo-600",
      snowy: "from-blue-200 to-white",
      windy: "from-gray-300 to-blue-300"
    }
    return colors[condition] || "from-blue-400 to-blue-600"
  }

  const getActivityRecommendation = (activity: ScheduledActivity, dayWeather: WeatherData) => {
    const { condition, temperature } = dayWeather

    if (condition === "rainy" && activity.category === "outdoor") {
      return {
        type: "warning" as const,
        message: "Consider indoor alternative due to rain",
        suggestion: "Move to covered area or reschedule"
      }
    }

    if (condition === "sunny" && temperature > 25) {
      return {
        type: "tip" as const,
        message: "Perfect weather for outdoor activities!",
        suggestion: "Don't forget sunscreen and water"
      }
    }

    if (temperature < 10 && activity.category === "outdoor") {
      return {
        type: "warning" as const,
        message: "Cold weather - dress warmly",
        suggestion: "Bring extra layers and warm drinks"
      }
    }

    return {
      type: "info" as const,
      message: "Good conditions for your activity",
      suggestion: "Enjoy your time outdoors!"
    }
  }

  const outdoorActivities = getOutdoorActivities()

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sun className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <span className="text-sm text-muted-foreground">Loading weather...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (outdoorActivities.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Cloud className="w-5 h-5" />
        Weather Forecast
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {weather.map((dayWeather, index) => {
          const WeatherIcon = getWeatherIcon(dayWeather.condition)
          const dayName = index === 0 ? "Saturday" : "Sunday"
          const dayActivities = outdoorActivities.filter(activity => 
            activity.day === (index === 0 ? "saturday" : "sunday")
          )

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className={`h-32 bg-gradient-to-br ${getWeatherColor(dayWeather.condition)} relative`}>
                  {/* Animated weather effects */}
                  <WeatherAnimationOverlay condition={dayWeather.condition} />
                  
                  <CardContent className="p-4 h-full flex items-center justify-between text-white relative z-10">
                    <div>
                      <h4 className="font-semibold text-lg">{dayName}</h4>
                      <p className="text-sm opacity-90">{dayWeather.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          <span>{dayWeather.temperature}°C</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Wind className="w-3 h-3" />
                          <span>{dayWeather.windSpeed} km/h</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: dayWeather.condition === "sunny" ? [0, 10, 0] : 0
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <WeatherIcon className="w-12 h-12" />
                    </motion.div>
                  </CardContent>
                </div>

                {/* Activity recommendations */}
                {dayActivities.length > 0 && (
                  <CardContent className="p-4 space-y-3">
                    <h5 className="font-medium text-sm">Outdoor Activities:</h5>
                    {dayActivities.map((activity) => {
                      const recommendation = getActivityRecommendation(activity, dayWeather)
                      return (
                        <div key={activity.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {activity.icon} {activity.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {activity.startTime}
                            </Badge>
                          </div>
                          
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className={`text-xs p-2 rounded ${
                              recommendation.type === "warning" 
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : recommendation.type === "tip"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            <p className="font-medium">{recommendation.message}</p>
                            <p className="mt-1 opacity-90">{recommendation.suggestion}</p>
                          </motion.div>
                        </div>
                      )
                    })}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

interface WeatherAnimationOverlayProps {
  condition: WeatherData["condition"]
}

function WeatherAnimationOverlay({ condition }: WeatherAnimationOverlayProps) {
  const animations = {
    sunny: (
      <div className="absolute inset-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-200 rounded-full"
            style={{
              top: `${20 + i * 30}%`,
              left: `${10 + i * 25}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    ),
    rainy: (
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-4 bg-blue-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: "-10px",
            }}
            animate={{
              y: [0, 150],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>
    ),
    cloudy: (
      <div className="absolute inset-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-4 bg-white/30 rounded-full"
            style={{
              top: `${20 + (i % 3) * 20}%`,
              left: `${10 + i * 15}%`,
            }}
            animate={{
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    ),
    snowy: (
      <div className="absolute inset-0">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: "-5px",
            }}
            animate={{
              y: [0, 140],
              x: [0, Math.random() * 20 - 10],
              rotate: [0, 360],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "linear"
            }}
          />
        ))}
      </div>
    ),
    windy: (
      <div className="absolute inset-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 bg-white/40 rounded-full"
            style={{
              top: `${30 + i * 15}%`,
              left: "0%",
              right: "0%",
            }}
            animate={{
              scaleX: [0, 1, 0],
              x: [0, 50, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <AnimatePresence>
      {animations[condition]}
    </AnimatePresence>
  )
}

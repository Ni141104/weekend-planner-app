"use client"

import { useState, useRef, useEffect } from "react"
import { motion, PanInfo, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, X, Clock, MapPin, Calendar } from "lucide-react"
import type { Activity } from "@/lib/types"
import { PREDEFINED_ACTIVITIES } from "@/lib/activities-data"

interface ActivitySwipeProps {
  onActivityAdd: (activity: Activity, day: "saturday" | "sunday") => void
  onActivitySkip: (activity: Activity) => void
  suggestedActivities?: Activity[]
  currentPlan?: {
    saturday: any[]
    sunday: any[]
  }
}

export function ActivitySwiper({ 
  onActivityAdd, 
  onActivitySkip, 
  suggestedActivities = PREDEFINED_ACTIVITIES,
  currentPlan 
}: ActivitySwipeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [selectedDay, setSelectedDay] = useState<"saturday" | "sunday">(() => {
    // Auto-select the day with fewer activities
    if (currentPlan) {
      return currentPlan.saturday.length <= currentPlan.sunday.length ? "saturday" : "sunday"
    }
    return "saturday"
  })
  const constraintsRef = useRef<HTMLDivElement>(null)

  const currentActivity = suggestedActivities[currentIndex]

  // Update selected day when plan changes
  useEffect(() => {
    if (currentPlan) {
      setSelectedDay(currentPlan.saturday.length <= currentPlan.sunday.length ? "saturday" : "sunday")
    }
  }, [currentPlan])

  const handleSwipe = (direction: "left" | "right", activity: Activity) => {
    setExitDirection(direction)
    
    if (direction === "right") {
      onActivityAdd(activity, selectedDay)
    } else {
      onActivitySkip(activity)
    }

    // Immediately update to next activity
    const nextIndex = (currentIndex + 1) % suggestedActivities.length
    setCurrentIndex(nextIndex)
    
    // Clear exit direction faster
    setTimeout(() => {
      setExitDirection(null)
    }, 150)
  }

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    activity: Activity
  ) => {
    const threshold = 100
    const { offset, velocity } = info

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      const direction = offset.x > 0 ? "right" : "left"
      handleSwipe(direction, activity)
    }
  }

  const cardVariants = {
    center: {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      opacity: 1,
      zIndex: 5,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "left" ? -1000 : 1000,
      y: Math.random() * 200 - 100,
      rotate: direction === "left" ? -30 : 30,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const
      }
    }),
    behind: (index: number) => ({
      x: 0,
      y: index * 4,
      rotate: 0,
      scale: 1 - index * 0.05,
      opacity: 1 - index * 0.2,
      zIndex: 5 - index,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    })
  }

  const getNextActivities = (count: number) => {
    const activities = []
    for (let i = 1; i <= count; i++) {
      const index = (currentIndex + i) % suggestedActivities.length
      activities.push({ activity: suggestedActivities[index], index: i })
    }
    return activities
  }

  if (!currentActivity) return null

  return (
    <div className="space-y-6">
      {/* Day Selection */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-full p-1 flex gap-1">
          <Button
            variant={selectedDay === "saturday" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedDay("saturday")}
            className={`rounded-full transition-all ${
              selectedDay === "saturday" 
                ? "bg-green-500 text-white hover:bg-green-600" 
                : "text-white hover:bg-white/20"
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Saturday
            {currentPlan && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/20 text-white border-0"
              >
                {currentPlan.saturday.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={selectedDay === "sunday" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedDay("sunday")}
            className={`rounded-full transition-all ${
              selectedDay === "sunday" 
                ? "bg-blue-500 text-white hover:bg-blue-600" 
                : "text-white hover:bg-white/20"
            }`}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Sunday
            {currentPlan && (
              <Badge 
                variant="secondary" 
                className="ml-2 bg-white/20 text-white border-0"
              >
                {currentPlan.sunday.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Smart Day Suggestion */}
      {currentPlan && (
        <div className="text-center">
          <p className="text-sm text-white/70 mb-2">
            💡 Suggested: <strong className="text-white">
              {currentPlan.saturday.length <= currentPlan.sunday.length ? "Saturday" : "Sunday"}
            </strong> (fewer activities)
          </p>
        </div>
      )}

      {/* Swiper Container */}
      <div className="relative w-full max-w-sm mx-auto h-[600px]" ref={constraintsRef}>
      {/* Background cards */}
      {getNextActivities(3).map(({ activity, index }) => (
        <motion.div
          key={`bg-${activity.id}-${currentIndex + index}`}
          className="absolute inset-0"
          variants={cardVariants}
          initial="behind"
          animate="behind"
          custom={index}
        >
          <ActivityCard 
            activity={activity} 
            isBackground={true} 
          />
        </motion.div>
      ))}

      {/* Main card */}
      <AnimatePresence>
        {currentActivity && (
          <motion.div
            key={`main-${currentActivity.id}-${currentIndex}`}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            variants={cardVariants}
            initial="center"
            animate="center"
            exit="exit"
            custom={exitDirection}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            onDragEnd={(e, info) => handleDragEnd(e, info, currentActivity)}
            style={{
              rotate: 0,
              scale: 1,
            }}
            whileDrag={{
              scale: 1.05,
              cursor: "grabbing"
            }}
          >
            <ActivityCard 
              activity={currentActivity} 
              isBackground={false}
              onLike={() => handleSwipe("right", currentActivity)}
              onPass={() => handleSwipe("left", currentActivity)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Day Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <Badge 
          className={`${
            selectedDay === "saturday" 
              ? "bg-green-500 text-white" 
              : "bg-blue-500 text-white"
          } backdrop-blur-md border-0 shadow-lg`}
        >
          Will be added to {selectedDay === "saturday" ? "Saturday" : "Sunday"}
        </Badge>
      </div>
      </div>
    </div>
  )
}

interface ActivityCardProps {
  activity: Activity
  isBackground?: boolean
  onLike?: () => void
  onPass?: () => void
}

function ActivityCard({ activity, isBackground = false, onLike, onPass }: ActivityCardProps) {
  // Get category-specific image and gradient
  const getActivityMedia = (category: string, name: string) => {
    const mediaMap: Record<string, { image: string; gradient: string }> = {
      outdoor: {
        image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-green-400 via-emerald-500 to-teal-600"
      },
      indoor: {
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-amber-400 via-orange-500 to-red-500"
      },
      social: {
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-pink-400 via-purple-500 to-indigo-600"
      },
      wellness: {
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-teal-400 via-cyan-500 to-blue-500"
      },
      food: {
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-yellow-400 via-red-500 to-pink-500"
      },
      entertainment: {
        image: "https://images.unsplash.com/photo-1489599956795-ac814d099a26?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-purple-400 via-pink-500 to-red-500"
      }
    }

    // Activity-specific images
    if (name.toLowerCase().includes('hiking')) {
      return {
        image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-green-500 via-emerald-600 to-teal-700"
      }
    }
    if (name.toLowerCase().includes('reading')) {
      return {
        image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-amber-500 via-orange-600 to-red-600"
      }
    }
    if (name.toLowerCase().includes('cooking')) {
      return {
        image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop&auto=format&q=80",
        gradient: "from-yellow-500 via-orange-600 to-red-600"
      }
    }

    return mediaMap[category] || mediaMap.outdoor
  }

  const { image, gradient } = getActivityMedia(activity.category, activity.name)

  return (
    <Card className={`h-full border-0 overflow-hidden shadow-2xl transform transition-all duration-300 ${
      isBackground ? "pointer-events-none opacity-50 scale-95" : "hover:scale-[1.02]"
    }`}>
      <div className="relative h-full">
        {/* Background image */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-75`} />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='33' cy='7' r='1'/%3E%3Ccircle cx='7' cy='33' r='1'/%3E%3Ccircle cx='33' cy='33' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        {/* Content */}
        <CardContent className="relative h-full p-6 flex flex-col justify-between text-white">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-6xl bg-white/20 rounded-2xl p-3 backdrop-blur-sm shadow-lg">
                {activity.icon}
              </div>
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-0 backdrop-blur-sm font-medium"
              >
                {activity.category}
              </Badge>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold mb-3 drop-shadow-lg">{activity.name}</h2>
              {activity.description && (
                <p className="text-white/95 leading-relaxed text-base drop-shadow-sm">
                  {activity.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-white/90">
              <div className="flex items-center gap-2 bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{activity.duration} min</span>
              </div>
              
              {activity.mood && (
                <Badge 
                  variant="outline" 
                  className="border-white/40 text-white bg-white/15 backdrop-blur-sm font-medium"
                >
                  {activity.mood}
                </Badge>
              )}
            </div>

            {!isBackground && (
              <div className="flex gap-3 pt-2">
                <motion.button
                  className="flex-1 py-3 px-6 rounded-full bg-black/20 backdrop-blur-md text-white font-semibold hover:bg-black/30 transition-all duration-200 border border-white/20 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onPass || (() => console.log('No onPass function'))}
                >
                  <X className="w-5 h-5 mr-2 inline" />
                  Pass
                </motion.button>
                <motion.button
                  className="flex-1 py-3 px-6 rounded-full bg-white/15 backdrop-blur-md text-white font-semibold hover:bg-white/25 transition-all duration-200 border border-white/30 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onLike || (() => console.log('No onLike function'))}
                >
                  <Heart className="w-5 h-5 mr-2 inline" />
                  Add to Plan
                </motion.button>
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

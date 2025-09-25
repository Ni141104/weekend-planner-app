"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, GripVertical, MoreHorizontal, X, Star } from "lucide-react"
import type { ScheduledActivity } from "@/lib/types"

interface AnimatedDraggableActivityCardProps {
  activity: ScheduledActivity
  onEdit?: (activity: ScheduledActivity) => void
  onDelete?: (activityId: string) => void
  onRate?: (activityId: string, rating: number) => void
}

export function AnimatedDraggableActivityCard({ 
  activity, 
  onEdit, 
  onDelete,
  onRate 
}: AnimatedDraggableActivityCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [rating, setRating] = useState(0)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${activity.id}-${activity.startTime}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleDelete = () => {
    setIsDeleting(true)
    // Delay the actual deletion to allow animation to play
    setTimeout(() => {
      onDelete?.(activity.id)
    }, 600)
  }

  const handleRate = (newRating: number) => {
    setRating(newRating)
    onRate?.(activity.id, newRating)
  }

  // Poof animation for deletion
  const poofVariants = {
    initial: { scale: 1, opacity: 1, rotate: 0 },
    exit: {
      scale: [1, 1.2, 0],
      opacity: [1, 0.8, 0],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 0.6,
        times: [0, 0.3, 1],
        ease: "easeOut" as const
      }
    }
  }

  // 3D flip animation
  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.6, ease: "easeInOut" as const }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.6, ease: "easeInOut" as const }
    }
  }

  // Drag rotation effect  
  const dragStyle = {
    rotate: isDragging ? 5 : 0,
    scale: isDragging ? 1.05 : 1,
    boxShadow: isDragging ? 
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" :
      "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }

  return (
    <AnimatePresence mode="wait">
      {!isDeleting ? (
        <motion.div
          ref={setNodeRef}
          style={style}
          variants={poofVariants}
          initial="initial"
          animate="initial"
          exit="exit"
          className="perspective-1000"
        >
          <motion.div
            animate={dragStyle}
            whileHover={{ 
              y: -2,
              transition: { type: "spring" as const, stiffness: 300, damping: 20 }
            }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <motion.div
              variants={flipVariants}
              animate={isFlipped ? "back" : "front"}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full h-full"
            >
              {/* Front of card */}
              <motion.div
                className="backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                <Card className="group cursor-pointer border-0 overflow-hidden relative bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <motion.div
                          {...attributes}
                          {...listeners}
                          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <motion.h3 
                            className="font-medium text-sm mb-1 leading-tight"
                            whileHover={{ x: 2 }}
                            transition={{ type: "spring", stiffness: 300 }}
                          >
                            {activity.icon} {activity.name}
                          </motion.h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {activity.startTime} - {activity.endTime}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            onClick={handleDelete}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {activity.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {activity.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                        >
                          {activity.duration}min
                        </Badge>
                        {activity.mood && (
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                          >
                            {activity.mood}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Back of card */}
              <motion.div
                className="absolute inset-0 backface-hidden"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <Card className="h-full border-0 bg-gradient-to-br from-purple-50 to-blue-50 backdrop-blur-sm">
                  <CardContent className="p-4 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm">Activity Details</h3>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <strong>Category:</strong> {activity.category}
                        </div>
                        <div>
                          <strong>Duration:</strong> {activity.duration} minutes
                        </div>
                        {activity.userMood && (
                          <div>
                            <strong>Your Mood:</strong> {activity.userMood}
                          </div>
                        )}
                        {activity.notes && (
                          <div>
                            <strong>Notes:</strong> {activity.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-medium">Rate this activity:</div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRate(star)}
                            className={`p-1 ${
                              star <= rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            <Star className="h-3 w-3 fill-current" />
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : (
        // Poof deletion animation
        <motion.div
          variants={poofVariants}
          initial="initial"
          animate="exit"
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            className="text-6xl"
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 0.6 }}
          >
            💫
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

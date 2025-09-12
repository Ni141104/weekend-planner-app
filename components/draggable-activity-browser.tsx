"use client"

import { useDraggable } from "@dnd-kit/core"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Activity } from "@/lib/types"
import { Clock, GripVertical } from "lucide-react"

interface DraggableActivityBrowserCardProps {
  activity: Activity
  onClick?: () => void
}

export function DraggableActivityBrowserCard({ activity, onClick }: DraggableActivityBrowserCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `browser-${activity.id}`,
    data: {
      type: "activity",
      activity,
    },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const getCategoryColor = (category: string) => {
    const colors = {
      outdoor: "bg-green-100 text-green-800",
      indoor: "bg-blue-100 text-blue-800",
      social: "bg-pink-100 text-pink-800",
      wellness: "bg-purple-100 text-purple-800",
      food: "bg-orange-100 text-orange-800",
      entertainment: "bg-yellow-100 text-yellow-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getMoodColor = (mood: string) => {
    const colors = {
      energetic: "bg-red-100 text-red-800",
      relaxed: "bg-blue-100 text-blue-800",
      happy: "bg-yellow-100 text-yellow-800",
      adventurous: "bg-green-100 text-green-800",
    }
    return colors[mood as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border hover:border-primary group ${
        isDragging ? "opacity-50 shadow-lg z-50" : ""
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4 relative">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">{activity.icon}</div>
          <h3 className="font-medium mb-2">{activity.name}</h3>
          <div className="flex flex-wrap gap-1 justify-center mb-2">
            <Badge className={getCategoryColor(activity.category)} variant="secondary">
              {activity.category}
            </Badge>
            {activity.mood && (
              <Badge className={getMoodColor(activity.mood)} variant="secondary">
                {activity.mood}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-2">
            <Clock className="h-3 w-3" />
            {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
          </div>
          {activity.description && <p className="text-xs text-muted-foreground line-clamp-2">{activity.description}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

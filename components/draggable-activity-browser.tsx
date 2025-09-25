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
      className={`cursor-grab active:cursor-grabbing hover:shadow-xl transition-all duration-200 border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 group w-full hover:scale-105 ${
        isDragging ? "opacity-50 shadow-2xl z-50 rotate-6 scale-110" : ""
      }`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3 relative">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-3 w-3 text-foreground/50" />
        </div>
        <div className="text-center">
          <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{activity.icon}</div>
          <h3 className="font-medium text-xs mb-3 line-clamp-2 leading-tight text-foreground">{activity.name}</h3>
          <div className="flex flex-col gap-1.5 mb-3">
            <Badge className={`${getCategoryColor(activity.category)} text-xs py-0.5 px-2 rounded-full border-0`} variant="secondary">
              {activity.category}
            </Badge>
            {activity.mood && (
              <Badge className={`${getMoodColor(activity.mood)} text-xs py-0.5 px-2 rounded-full border-0`} variant="secondary">
                {activity.mood}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {Math.floor(activity.duration / 60)}h{activity.duration % 60 > 0 ? ` ${activity.duration % 60}m` : ''}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

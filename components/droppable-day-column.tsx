"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DraggableActivityCard } from "./draggable-activity-card"
import type { ScheduledActivity } from "@/lib/types"
import { Calendar, Clock, Plus } from "lucide-react"

interface DroppableDayColumnProps {
  day: "saturday" | "sunday"
  activities: ScheduledActivity[]
  onAddActivity?: () => void
}

export function DroppableDayColumn({ day, activities, onAddActivity }: DroppableDayColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: day,
  })

  const dayName = day.charAt(0).toUpperCase() + day.slice(1)
  const sortedActivities = activities.sort((a, b) => a.startTime.localeCompare(b.startTime))
  const activityIds = sortedActivities.map((activity) => `${activity.id}-${activity.startTime}`)

  const getTotalDuration = () => {
    return activities.reduce((total, activity) => total + activity.duration, 0)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <Card className={`transition-colors ${isOver ? "ring-2 ring-primary bg-primary/5" : ""}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {dayName}
            <Badge variant="outline">{activities.length} activities</Badge>
          </CardTitle>
          <Button size="sm" onClick={onAddActivity}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
        {activities.length > 0 && (
          <div className="text-sm text-muted-foreground">Total duration: {formatDuration(getTotalDuration())}</div>
        )}
      </CardHeader>
      <CardContent ref={setNodeRef}>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No activities planned yet</p>
            <p className="text-sm">Drag activities here or browse below!</p>
          </div>
        ) : (
          <SortableContext items={activityIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {sortedActivities.map((activity) => (
                <DraggableActivityCard key={`${activity.id}-${activity.startTime}`} activity={activity} />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  )
}

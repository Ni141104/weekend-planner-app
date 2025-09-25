"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DraggableActivityCard } from "./draggable-activity-card"
import { ActivityDropdown } from "./activity-dropdown"
import type { ScheduledActivity, Activity } from "@/lib/types"
import { Calendar, Clock, AlertCircle } from "lucide-react"

interface DroppableDayColumnProps {
  day: "saturday" | "sunday"
  activities: ScheduledActivity[]
  onAddActivity?: (activity: Activity) => void
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

  // Check for any gaps or overlaps in the schedule
  const hasScheduleIssues = () => {
    for (let i = 0; i < sortedActivities.length - 1; i++) {
      const current = sortedActivities[i]
      const next = sortedActivities[i + 1]
      if (current.endTime > next.startTime) {
        return true // Overlap detected
      }
    }
    return false
  }

  return (
    <Card className={`transition-all duration-300 ${isOver ? "ring-2 ring-primary bg-primary/10 shadow-lg scale-[1.02]" : "hover:shadow-md"}`}>
      <CardHeader className="pb-4 px-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            {dayName}
            <Badge variant="outline" className="bg-background text-xs">
              {activities.length} {activities.length === 1 ? 'activity' : 'activities'}
            </Badge>
          </CardTitle>
          {onAddActivity && (
            <ActivityDropdown onActivitySelect={onAddActivity} day={day} />
          )}
        </div>
        {activities.length > 0 && (
          <div className="text-xs sm:text-sm text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              Total: {formatDuration(getTotalDuration())}
            </div>
            {hasScheduleIssues() && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span className="text-xs">Smart scheduling applied</span>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent ref={setNodeRef} className="min-h-[150px] sm:min-h-[200px] px-3 sm:px-6">
        {activities.length === 0 ? (
          <div className={`text-center py-8 sm:py-12 rounded-lg border-2 border-dashed transition-colors ${
            isOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}>
            <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 opacity-30" />
            <p className="text-sm sm:text-base text-muted-foreground font-medium mb-1">No activities planned yet</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="hidden sm:inline">Drag activities here to get started!</span>
              <span className="sm:hidden">Tap Add to get started!</span>
            </p>
          </div>
        ) : (
          <SortableContext items={activityIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 sm:space-y-3">
              {sortedActivities.map((activity) => (
                <DraggableActivityCard key={`${activity.id}-${activity.startTime}`} activity={activity} />
              ))}
              {isOver && (
                <div className="border-2 border-dashed border-primary rounded-lg p-3 sm:p-4 bg-primary/5 text-center text-xs sm:text-sm text-primary">
                  Drop here to add activity
                </div>
              )}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ScheduledActivity } from "@/lib/types"
import { ActivityCard } from "./activity-card"
import { Calendar, Clock, Plus } from "lucide-react"
import { useState } from "react"

interface ScheduleTimelineProps {
  day: "saturday" | "sunday"
  activities: ScheduledActivity[]
  onAddActivity?: () => void
}

export function ScheduleTimeline({ day, activities, onAddActivity }: ScheduleTimelineProps) {
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list")

  const dayName = day.charAt(0).toUpperCase() + day.slice(1)
  const sortedActivities = activities.sort((a, b) => a.startTime.localeCompare(b.startTime))

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`
      const hasActivity = sortedActivities.find(
        (activity) => activity.startTime <= timeString && activity.endTime > timeString,
      )
      slots.push({
        time: timeString,
        displayTime: hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`,
        activity: hasActivity,
      })
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

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

  if (viewMode === "timeline") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {dayName}
              <Badge variant="outline">{activities.length} activities</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setViewMode("list")}>
                List View
              </Button>
              <Button size="sm" onClick={onAddActivity}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
          {activities.length > 0 && (
            <div className="text-sm text-muted-foreground">Total duration: {formatDuration(getTotalDuration())}</div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div key={slot.time} className="flex items-center gap-4 py-2 border-l-2 border-muted pl-4 relative">
                <div className="absolute -left-2 w-4 h-4 bg-background border-2 border-muted rounded-full"></div>
                <div className="w-16 text-sm font-medium text-muted-foreground">{slot.displayTime}</div>
                <div className="flex-1">
                  {slot.activity ? (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{slot.activity.icon}</span>
                        <div>
                          <h4 className="font-medium">{slot.activity.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {slot.activity.startTime} - {slot.activity.endTime}
                          </p>
                        </div>
                        {slot.activity.mood && (
                          <Badge variant="secondary" className="ml-auto">
                            {slot.activity.mood}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">Free time</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {dayName}
            <Badge variant="outline">{activities.length} activities</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setViewMode("timeline")}>
              Timeline View
            </Button>
            <Button size="sm" onClick={onAddActivity}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
        {activities.length > 0 && (
          <div className="text-sm text-muted-foreground">Total duration: {formatDuration(getTotalDuration())}</div>
        )}
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No activities planned yet</p>
            <p className="text-sm">Browse activities to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedActivities.map((activity) => (
              <ActivityCard key={`${activity.id}-${activity.startTime}`} activity={activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

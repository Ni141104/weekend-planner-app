"use client"

import type { ScheduledActivity } from "@/lib/types"

interface TimeSlotIndicatorProps {
  activities: ScheduledActivity[]
}

export function TimeSlotIndicator({ activities }: TimeSlotIndicatorProps) {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number)
    return hours * 60 + minutes
  }

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24
    const mins = minutes % 60
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
  }

  // Create time slots from 6 AM to 11 PM (17 hours)
  const startHour = 6
  const endHour = 23
  const totalMinutes = (endHour - startHour) * 60
  const slotHeight = 4 // Height per hour in rem

  const sortedActivities = activities.sort((a, b) => 
    timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  )

  return (
    <div className="relative w-full" style={{ height: `${(endHour - startHour) * slotHeight}rem` }}>
      {/* Time grid background */}
      <div className="absolute inset-0">
        {Array.from({ length: endHour - startHour + 1 }, (_, i) => (
          <div
            key={i}
            className="absolute w-full border-t border-muted-foreground/10"
            style={{ top: `${i * slotHeight}rem` }}
          >
            <span className="text-xs text-muted-foreground/60 absolute -left-12 -top-2">
              {minutesToTime((startHour + i) * 60)}
            </span>
          </div>
        ))}
      </div>

      {/* Activity blocks */}
      {sortedActivities.map((activity, index) => {
        const startMinutes = timeToMinutes(activity.startTime)
        const endMinutes = timeToMinutes(activity.endTime)
        const offsetMinutes = startMinutes - (startHour * 60)
        const durationMinutes = endMinutes - startMinutes

        const topPosition = (offsetMinutes / 60) * slotHeight
        const height = (durationMinutes / 60) * slotHeight

        return (
          <div
            key={`${activity.id}-${activity.startTime}`}
            className="absolute left-0 right-0 mx-1 rounded-md bg-primary/20 border border-primary/30 p-2 text-xs"
            style={{
              top: `${topPosition}rem`,
              height: `${Math.max(height, 1)}rem`
            }}
          >
            <div className="font-medium truncate">{activity.name}</div>
            <div className="text-muted-foreground">
              {activity.startTime} - {activity.endTime}
            </div>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PREDEFINED_ACTIVITIES, WEEKEND_THEMES } from "@/lib/activities-data"
import { useWeekendPlannerStore } from "@/lib/store"
import type { WeekendPlan, Activity } from "@/lib/types"
import { Lightbulb, Plus } from "lucide-react"

interface ScheduleSuggestionsProps {
  plan: WeekendPlan
}

export function ScheduleSuggestions({ plan }: ScheduleSuggestionsProps) {
  const { addActivityToSchedule } = useWeekendPlannerStore()

  const getScheduledActivityIds = () => {
    return [...plan.saturday, ...plan.sunday].map((activity) => activity.id)
  }

  const getSuggestedActivities = () => {
    const scheduledIds = getScheduledActivityIds()
    const theme = WEEKEND_THEMES.find((t) => t.id === plan.theme)

    if (!theme) return []

    // Get activities suggested by the theme that aren't already scheduled
    const themeActivities = PREDEFINED_ACTIVITIES.filter(
      (activity) => theme.suggestedActivities.includes(activity.id) && !scheduledIds.includes(activity.id),
    )

    // If we have fewer than 3 theme activities, add some random ones from the same mood
    if (themeActivities.length < 3) {
      const scheduledMoods = [...plan.saturday, ...plan.sunday].map((activity) => activity.mood).filter(Boolean)
      const dominantMood = scheduledMoods.length > 0 ? scheduledMoods[0] : undefined

      const additionalActivities = PREDEFINED_ACTIVITIES.filter(
        (activity) =>
          !scheduledIds.includes(activity.id) &&
          !themeActivities.some((ta) => ta.id === activity.id) &&
          (dominantMood ? activity.mood === dominantMood : true),
      ).slice(0, 3 - themeActivities.length)

      return [...themeActivities, ...additionalActivities]
    }

    return themeActivities.slice(0, 3)
  }

  const getTimeGaps = () => {
    const gaps = []

    // Check Saturday gaps
    const saturdayActivities = plan.saturday.sort((a, b) => a.startTime.localeCompare(b.startTime))
    if (saturdayActivities.length === 0) {
      gaps.push({ day: "saturday" as const, time: "09:00", reason: "Start your Saturday" })
    } else {
      // Check for gaps between activities
      for (let i = 0; i < saturdayActivities.length - 1; i++) {
        const current = saturdayActivities[i]
        const next = saturdayActivities[i + 1]
        const currentEnd = current.endTime
        const nextStart = next.startTime

        if (currentEnd < nextStart) {
          gaps.push({ day: "saturday" as const, time: currentEnd, reason: "Fill the gap" })
        }
      }
    }

    // Check Sunday gaps
    const sundayActivities = plan.sunday.sort((a, b) => a.startTime.localeCompare(b.startTime))
    if (sundayActivities.length === 0) {
      gaps.push({ day: "sunday" as const, time: "09:00", reason: "Start your Sunday" })
    } else {
      // Check for gaps between activities
      for (let i = 0; i < sundayActivities.length - 1; i++) {
        const current = sundayActivities[i]
        const next = sundayActivities[i + 1]
        const currentEnd = current.endTime
        const nextStart = next.startTime

        if (currentEnd < nextStart) {
          gaps.push({ day: "sunday" as const, time: currentEnd, reason: "Fill the gap" })
        }
      }
    }

    return gaps.slice(0, 2) // Limit to 2 suggestions
  }

  const handleAddSuggestion = (activity: Activity, day: "saturday" | "sunday", time: string) => {
    addActivityToSchedule(activity, day, time)
  }

  const suggestedActivities = getSuggestedActivities()
  const timeGaps = getTimeGaps()

  if (suggestedActivities.length === 0 && timeGaps.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activity Suggestions */}
        {suggestedActivities.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Recommended Activities</h4>
            <div className="space-y-2">
              {suggestedActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{activity.name}</h5>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSuggestion(activity, "saturday", "09:00")}
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Sat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSuggestion(activity, "sunday", "09:00")}
                      className="h-7 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Sun
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Gap Suggestions */}
        {timeGaps.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Schedule Gaps</h4>
            <div className="space-y-2">
              {timeGaps.map((gap, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm capitalize">{gap.day}</div>
                    <div className="text-xs text-muted-foreground">
                      {gap.reason} at {gap.time}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Free time
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

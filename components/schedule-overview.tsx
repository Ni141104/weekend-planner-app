"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { WeekendPlan } from "@/lib/types"
import { Calendar, TrendingUp, Share2 } from "lucide-react"

interface ScheduleOverviewProps {
  plan: WeekendPlan
  onShare?: () => void
}

export function ScheduleOverview({ plan, onShare }: ScheduleOverviewProps) {
  const getTotalActivities = () => {
    return plan.saturday.length + plan.sunday.length
  }

  const getTotalDuration = () => {
    const saturdayDuration = plan.saturday.reduce((total, activity) => total + activity.duration, 0)
    const sundayDuration = plan.sunday.reduce((total, activity) => total + activity.duration, 0)
    return saturdayDuration + sundayDuration
  }

  const getMoodDistribution = () => {
    const allActivities = [...plan.saturday, ...plan.sunday]
    const moodCounts = allActivities.reduce(
      (acc, activity) => {
        if (activity.mood) {
          acc[activity.mood] = (acc[activity.mood] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
    return moodCounts
  }

  const getCategoryDistribution = () => {
    const allActivities = [...plan.saturday, ...plan.sunday]
    const categoryCounts = allActivities.reduce(
      (acc, activity) => {
        acc[activity.category] = (acc[activity.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return categoryCounts
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
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

  const totalActivities = getTotalActivities()
  const totalDuration = getTotalDuration()
  const moodDistribution = getMoodDistribution()
  const categoryDistribution = getCategoryDistribution()

  const balanceScore = Math.min(100, (Object.keys(categoryDistribution).length / 6) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekend Overview
          </CardTitle>
          <Button size="sm" variant="outline" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalActivities}</div>
            <div className="text-sm text-muted-foreground">Total Activities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{formatDuration(totalDuration)}</div>
            <div className="text-sm text-muted-foreground">Total Duration</div>
          </div>
        </div>

        {/* Balance Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Activity Balance</span>
            <span className="text-sm text-muted-foreground">{Math.round(balanceScore)}%</span>
          </div>
          <Progress value={balanceScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Variety across {Object.keys(categoryDistribution).length} categories
          </p>
        </div>

        {/* Day Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Saturday
            </h4>
            <div className="text-sm text-muted-foreground">
              {plan.saturday.length} activities
              <br />
              {formatDuration(plan.saturday.reduce((total, activity) => total + activity.duration, 0))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Sunday
            </h4>
            <div className="text-sm text-muted-foreground">
              {plan.sunday.length} activities
              <br />
              {formatDuration(plan.sunday.reduce((total, activity) => total + activity.duration, 0))}
            </div>
          </div>
        </div>

        {/* Mood Distribution */}
        {Object.keys(moodDistribution).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Mood Distribution</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(moodDistribution).map(([mood, count]) => (
                <Badge key={mood} className={getMoodColor(mood)} variant="secondary">
                  {mood} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Category Distribution */}
        {Object.keys(categoryDistribution).length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Activity Categories</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryDistribution).map(([category, count]) => (
                <Badge key={category} className={getCategoryColor(category)} variant="secondary">
                  {category} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Last updated: {plan.updatedAt.toLocaleDateString()} at {plan.updatedAt.toLocaleTimeString()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

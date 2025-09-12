"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useWeekendPlannerStore } from "@/lib/store"
import type { WeekendPlan, MoodEntry } from "@/lib/types"
import { Heart, TrendingUp, Plus } from "lucide-react"

interface MoodTrackerProps {
  plan: WeekendPlan
}

const MOODS = [
  { id: "excited", name: "Excited", icon: "😄", color: "bg-yellow-100 text-yellow-800" },
  { id: "motivated", name: "Motivated", icon: "💪", color: "bg-green-100 text-green-800" },
  { id: "neutral", name: "Neutral", icon: "😐", color: "bg-gray-100 text-gray-800" },
  { id: "tired", name: "Tired", icon: "😴", color: "bg-blue-100 text-blue-800" },
  { id: "stressed", name: "Stressed", icon: "😰", color: "bg-red-100 text-red-800" },
] as const

export function MoodTracker({ plan }: MoodTrackerProps) {
  const [isAddMoodOpen, setIsAddMoodOpen] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [moodNotes, setMoodNotes] = useState("")
  const { updatePlanMood } = useWeekendPlannerStore()

  const handleAddMood = () => {
    if (selectedMood) {
      const newMoodEntry: MoodEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        mood: selectedMood as any,
        notes: moodNotes || undefined,
      }

      updatePlanMood(plan.id, selectedMood as any, newMoodEntry)
      setSelectedMood("")
      setMoodNotes("")
      setIsAddMoodOpen(false)
    }
  }

  const getMoodStats = () => {
    const moodEntries = plan.moodJournal || []
    if (moodEntries.length === 0) return null

    const moodCounts = moodEntries.reduce(
      (acc, entry) => {
        acc[entry.mood] = (acc[entry.mood] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const totalEntries = moodEntries.length
    const dominantMood = Object.entries(moodCounts).reduce((a, b) => (moodCounts[a[0]] > moodCounts[b[0]] ? a : b))[0]

    return {
      totalEntries,
      dominantMood,
      moodCounts,
    }
  }

  const stats = getMoodStats()
  const recentMoods = (plan.moodJournal || []).slice(-3).reverse()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Mood Tracker
          </CardTitle>
          <Dialog open={isAddMoodOpen} onOpenChange={setIsAddMoodOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Log Mood
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How are you feeling?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select your mood</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {MOODS.map((mood) => (
                      <Button
                        key={mood.id}
                        variant={selectedMood === mood.id ? "default" : "outline"}
                        onClick={() => setSelectedMood(mood.id)}
                        className="h-auto p-3 flex flex-col gap-1"
                      >
                        <span className="text-2xl">{mood.icon}</span>
                        <span className="text-sm">{mood.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="mood-notes">Notes (optional)</Label>
                  <Textarea
                    id="mood-notes"
                    placeholder="How are you feeling about your weekend plans?"
                    value={moodNotes}
                    onChange={(e) => setMoodNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddMoodOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddMood} disabled={!selectedMood} className="flex-1">
                    Log Mood
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Mood */}
        {plan.overallMood && (
          <div>
            <h4 className="font-medium mb-2">Current Mood</h4>
            <div className="flex items-center gap-2">
              {MOODS.find((m) => m.id === plan.overallMood) && (
                <>
                  <span className="text-2xl">{MOODS.find((m) => m.id === plan.overallMood)?.icon}</span>
                  <Badge className={MOODS.find((m) => m.id === plan.overallMood)?.color}>
                    {MOODS.find((m) => m.id === plan.overallMood)?.name}
                  </Badge>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recent Moods */}
        {recentMoods.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recent Moods</h4>
            <div className="space-y-2">
              {recentMoods.map((entry) => {
                const mood = MOODS.find((m) => m.id === entry.mood)
                return (
                  <div key={entry.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                    <span className="text-lg">{mood?.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={mood?.color} variant="secondary">
                          {mood?.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {entry.notes && <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Mood Stats */}
        {stats && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Mood Insights
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Total entries:</span>
                <span className="font-medium">{stats.totalEntries}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Dominant mood:</span>
                <Badge className={MOODS.find((m) => m.id === stats.dominantMood)?.color} variant="secondary">
                  {MOODS.find((m) => m.id === stats.dominantMood)?.name}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-1 mt-3">
                {Object.entries(stats.moodCounts).map(([mood, count]) => {
                  const moodData = MOODS.find((m) => m.id === mood)
                  const percentage = Math.round((count / stats.totalEntries) * 100)
                  return (
                    <div key={mood} className="text-center p-2 bg-muted/30 rounded">
                      <div className="text-lg">{moodData?.icon}</div>
                      <div className="text-xs font-medium">{percentage}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!plan.moodJournal || plan.moodJournal.length === 0) && (
          <div className="text-center py-6 text-muted-foreground">
            <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No mood entries yet</p>
            <p className="text-sm">Start tracking how you feel about your weekend!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

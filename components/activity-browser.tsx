"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { PREDEFINED_ACTIVITIES } from "@/lib/activities-data"
import { useWeekendPlannerStore } from "@/lib/store"
import { DraggableActivityBrowserCard } from "./draggable-activity-browser"
import type { Activity } from "@/lib/types"
import { Search, Filter, Plus, Clock } from "lucide-react"

interface ActivityBrowserProps {
  onActivityAdd?: (activity: Activity, day: "saturday" | "sunday", startTime: string) => void
}

export function ActivityBrowser({ onActivityAdd }: ActivityBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMood, setSelectedMood] = useState<string>("all")
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [selectedDay, setSelectedDay] = useState<"saturday" | "sunday">("saturday")
  const [selectedTime, setSelectedTime] = useState("09:00")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { addActivityToSchedule } = useWeekendPlannerStore()

  const categories = ["all", "outdoor", "indoor", "social", "wellness", "food", "entertainment"]
  const moods = ["all", "energetic", "relaxed", "happy", "adventurous"]

  const filteredActivities = PREDEFINED_ACTIVITIES.filter((activity) => {
    const matchesSearch =
      activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || activity.category === selectedCategory
    const matchesMood = selectedMood === "all" || activity.mood === selectedMood

    return matchesSearch && matchesCategory && matchesMood
  })

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity)
    setIsAddDialogOpen(true)
  }

  const handleAddActivity = () => {
    if (selectedActivity) {
      addActivityToSchedule(selectedActivity, selectedDay, selectedTime)
      onActivityAdd?.(selectedActivity, selectedDay, selectedTime)
      setIsAddDialogOpen(false)
      setSelectedActivity(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Activity Browser
        </CardTitle>
        <p className="text-sm text-muted-foreground">Click to add or drag to schedule</p>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMood} onValueChange={setSelectedMood}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Mood" />
            </SelectTrigger>
            <SelectContent>
              {moods.map((mood) => (
                <SelectItem key={mood} value={mood}>
                  {mood === "all" ? "All Moods" : mood.charAt(0).toUpperCase() + mood.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
          {filteredActivities.map((activity) => (
            <DraggableActivityBrowserCard
              key={activity.id}
              activity={activity}
              onClick={() => handleActivitySelect(activity)}
            />
          ))}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No activities found matching your criteria</p>
            <p className="text-sm">Try adjusting your filters or search term</p>
          </div>
        )}

        {/* Add Activity Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Activity to Schedule
              </DialogTitle>
            </DialogHeader>
            {selectedActivity && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">{selectedActivity.icon}</div>
                  <h3 className="text-xl font-semibold">{selectedActivity.name}</h3>
                  <p className="text-muted-foreground">{selectedActivity.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="day">Day</Label>
                    <Select value={selectedDay} onValueChange={(value: "saturday" | "sunday") => setSelectedDay(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Start Time</Label>
                    <Input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Duration: {Math.floor(selectedActivity.duration / 60)}h {selectedActivity.duration % 60}m
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddActivity} className="flex-1">
                    Add to Schedule
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

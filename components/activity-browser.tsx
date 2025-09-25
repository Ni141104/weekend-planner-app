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
import { CustomActivityCreator } from "./custom-activity-creator"
import type { Activity } from "@/lib/types"
import { Search, Filter, Plus, Clock, Info, Heart } from "lucide-react"

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

  const { addActivityToSchedule, customActivities, addCustomActivity } = useWeekendPlannerStore()

  // Combine predefined and custom activities
  const allActivities = [...PREDEFINED_ACTIVITIES, ...customActivities]

  const categories = ["all", "outdoor", "indoor", "social", "wellness", "food", "entertainment"]
  const moods = ["all", "energetic", "relaxed", "happy", "adventurous"]

  const filteredActivities = allActivities.filter((activity) => {
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

  const handleCustomActivityCreated = (activity: Activity) => {
    addCustomActivity(activity)
  }

  return (
    <div className="max-h-[600px] flex flex-col bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-indigo-500/10 backdrop-blur-sm border border-violet-200/30 rounded-2xl overflow-hidden shadow-lg" data-activity-browser>
      {/* Streamlined Header - Enhanced colors */}
      <div className="shrink-0 bg-gradient-to-r from-violet-600/20 via-purple-600/15 to-indigo-600/20 p-4 border-b border-violet-200/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20 backdrop-blur-sm border border-violet-300/30">
              <Search className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Activity Browser</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">Discover and plan your weekend</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-100/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-emerald-200/50">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-emerald-700">Smart scheduling</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Section - Enhanced colors */}
      <div className="shrink-0 p-4 border-b border-violet-200/20">
        <div className="space-y-3">
          {/* Search Bar - Better color scheme */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white/70 backdrop-blur-sm border-violet-200/50 rounded-xl text-sm placeholder:text-slate-400 focus:bg-white/90 focus:border-violet-400/60 transition-all focus:ring-2 focus:ring-violet-300/30"
            />
          </div>
          
          {/* Filter Controls - Improved styling */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-10 bg-white/60 backdrop-blur-sm border-violet-200/50 rounded-xl hover:bg-white/80 hover:border-violet-300/60 transition-all">
                <div className="flex items-center gap-2">
                  <Filter className="h-3 w-3 text-violet-600" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-violet-200/30 rounded-xl z-50 shadow-lg">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="hover:bg-violet-50 rounded-lg text-slate-700">
                    {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger className="h-10 bg-white/60 backdrop-blur-sm border-violet-200/50 rounded-xl hover:bg-white/80 hover:border-violet-300/60 transition-all">
                <div className="flex items-center gap-2">
                  <Heart className="h-3 w-3 text-pink-500" />
                  <SelectValue placeholder="All Moods" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-md border-violet-200/30 rounded-xl z-50 shadow-lg">
                {moods.map((mood) => (
                  <SelectItem key={mood} value={mood} className="hover:bg-pink-50 rounded-lg text-slate-700">
                    {mood === "all" ? "All Moods" : mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Activities Grid Section - Enhanced styling */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full">
          {/* Results Header - Better colors */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {filteredActivities.length > 0 
                ? `${filteredActivities.length} Activities`
                : "No Activities Found"
              }
            </h3>
            {filteredActivities.length > 4 && (
              <div className="text-xs text-slate-500 bg-slate-100/60 dark:bg-slate-700/60 px-2 py-1 rounded-full border border-slate-200/50">
                Scroll →
              </div>
            )}
          </div>

          {/* Activities Container */}
          {filteredActivities.length > 0 ? (
            <div className="h-full">
              {/* Horizontal Scroll Container - Improved for more cards */}
              <div 
                className="flex gap-3 h-full overflow-x-auto overflow-y-hidden pb-4"
                style={{
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.3) transparent'
                }}
              >
                {/* Custom Activity Creator - Smaller size */}
                <div 
                  className="shrink-0 h-full"
                  style={{ 
                    width: 'min(200px, calc(20vw - 1rem))',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <CustomActivityCreator onActivityCreated={handleCustomActivityCreated} />
                </div>
                
                {/* Activity Cards - Reduced size to show 4-5 cards */}
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="shrink-0 h-full"
                    style={{ 
                      width: 'min(200px, calc(20vw - 1rem))',
                      scrollSnapAlign: 'start'
                    }}
                  >
                    <DraggableActivityBrowserCard
                      activity={activity}
                      onClick={() => handleActivitySelect(activity)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State - Enhanced colors */
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-violet-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-violet-200/50">
                  <Search className="h-10 w-10 text-violet-400" />
                </div>
                <h4 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">No activities found</h4>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try adjusting your search terms or filters to find more activities.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedMood("all")
                  }}
                  className="mt-4 bg-white/80 border-violet-200/60 hover:bg-violet-50 hover:border-violet-300/70 text-violet-700"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Dialog - Enhanced styling */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-md border-violet-200/30 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
              <Plus className="h-5 w-5 text-violet-600" />
              Add Activity to Schedule
            </DialogTitle>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl mb-3">{selectedActivity.icon}</div>
                <h3 className="text-2xl font-bold mb-2 text-slate-800">{selectedActivity.name}</h3>
                <p className="text-slate-600 text-base">{selectedActivity.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day" className="text-sm font-medium text-slate-700">Day</Label>
                  <Select value={selectedDay} onValueChange={(value: "saturday" | "sunday") => setSelectedDay(value)}>
                    <SelectTrigger className="h-12 bg-white/80 border-violet-200/50 hover:border-violet-300/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-md">
                      <SelectItem value="saturday">Saturday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm font-medium text-slate-700">Start Time</Label>
                  <Input 
                    type="time" 
                    value={selectedTime} 
                    onChange={(e) => setSelectedTime(e.target.value)} 
                    className="h-12 bg-white/80 border-violet-200/50 hover:border-violet-300/70"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-600 bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200/50">
                <Clock className="h-5 w-5 text-violet-600" />
                <span className="font-medium">
                  Duration: {Math.floor(selectedActivity.duration / 60)}h {selectedActivity.duration % 60}m
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)} 
                  className="flex-1 h-12 bg-white/80 border-violet-200/50 hover:bg-violet-50 hover:border-violet-300/70 text-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddActivity} 
                  className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  Add to Schedule
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
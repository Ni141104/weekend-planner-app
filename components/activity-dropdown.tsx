"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { PREDEFINED_ACTIVITIES } from "@/lib/activities-data"
import type { Activity } from "@/lib/types"
import { Plus, Search, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ActivityDropdownProps {
  onActivitySelect: (activity: Activity) => void
  day: "saturday" | "sunday"
}

export function ActivityDropdown({ onActivitySelect, day }: ActivityDropdownProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Group activities by category
  const categorizedActivities = PREDEFINED_ACTIVITIES.reduce((acc, activity) => {
    if (!acc[activity.category]) {
      acc[activity.category] = []
    }
    acc[activity.category].push(activity)
    return acc
  }, {} as Record<string, Activity[]>)

  // Filter activities based on search term
  const filteredActivities = searchTerm
    ? PREDEFINED_ACTIVITIES.filter(activity =>
        activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.description && activity.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : selectedCategory
    ? categorizedActivities[selectedCategory] || []
    : []

  const categories = Object.keys(categorizedActivities)

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      outdoor: "🌳",
      indoor: "🏠", 
      social: "👥",
      wellness: "🧘",
      entertainment: "🎭",
      food: "🍽️"
    }
    return emojiMap[category] || "📝"
  }

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      outdoor: "bg-green-50 text-green-700 border-green-200",
      indoor: "bg-blue-50 text-blue-700 border-blue-200",
      social: "bg-purple-50 text-purple-700 border-purple-200", 
      wellness: "bg-teal-50 text-teal-700 border-teal-200",
      entertainment: "bg-pink-50 text-pink-700 border-pink-200",
      food: "bg-orange-50 text-orange-700 border-orange-200"
    }
    return colorMap[category] || "bg-gray-50 text-gray-700 border-gray-200"
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const handleActivitySelect = (activity: Activity) => {
    onActivitySelect(activity)
    setOpen(false)
    setSearchTerm("")
    setSelectedCategory(null)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="hover:bg-primary hover:text-primary-foreground touch-target"
        >
          <Plus className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-96 overflow-hidden" align="end">
        <DropdownMenuLabel className="text-base font-semibold">
          Add to {day.charAt(0).toUpperCase() + day.slice(1)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Search Box */}
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setSelectedCategory(null)
              }}
              className="pl-8 h-9"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {searchTerm ? (
            /* Search Results */
            filteredActivities.length > 0 ? (
              <DropdownMenuGroup>
                {filteredActivities.map((activity) => (
                  <DropdownMenuItem
                    key={activity.id}
                    onClick={() => handleActivitySelect(activity)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                  >
                    <span className="text-xl">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{activity.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">
                        {formatDuration(activity.duration)}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getCategoryColor(activity.category)}`}
                      >
                        {getCategoryEmoji(activity.category)} {activity.category}
                      </Badge>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No activities found for "{searchTerm}"
              </div>
            )
          ) : selectedCategory ? (
            /* Category Activities */
            <DropdownMenuGroup>
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-muted-foreground"
                >
                  ← Back to categories
                </Button>
              </div>
              {(categorizedActivities[selectedCategory] || []).map((activity) => (
                <DropdownMenuItem
                  key={activity.id}
                  onClick={() => handleActivitySelect(activity)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                >
                  <span className="text-xl">{activity.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{activity.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(activity.duration)}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ) : (
            /* Categories */
            <DropdownMenuGroup>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-accent"
                >
                  <span className="text-xl">{getCategoryEmoji(category)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm capitalize">{category}</div>
                    <div className="text-xs text-muted-foreground">
                      {categorizedActivities[category].length} activities
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getCategoryColor(category)}`}
                  >
                    View →
                  </Badge>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

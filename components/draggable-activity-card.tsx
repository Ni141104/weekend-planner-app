"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ScheduledActivity } from "@/lib/types"
import { useWeekendPlannerStore } from "@/lib/store"
import { Clock, X, Edit, GripVertical } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DraggableActivityCardProps {
  activity: ScheduledActivity
  onEdit?: (activity: ScheduledActivity) => void
  onRemove?: (activity: ScheduledActivity) => void
}

export function DraggableActivityCard({ activity, onEdit, onRemove }: DraggableActivityCardProps) {
  const { removeActivityFromSchedule, updateActivityTime } = useWeekendPlannerStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editTime, setEditTime] = useState(activity.startTime)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${activity.id}-${activity.startTime}`,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleRemove = () => {
    removeActivityFromSchedule(activity.id, activity.day)
    onRemove?.(activity)
  }

  const handleEdit = () => {
    setEditTime(activity.startTime)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    updateActivityTime(activity.id, activity.day, editTime)
    setIsEditDialogOpen(false)
    onEdit?.(activity)
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

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`group hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
          isDragging ? "opacity-50 shadow-lg" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>

            <span className="text-2xl">{activity.icon}</span>
            <div className="flex-1">
              <h4 className="font-medium">{activity.name}</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {activity.startTime} - {activity.endTime}
              </div>
              {activity.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{activity.description}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              {activity.mood && (
                <Badge className={getMoodColor(activity.mood)} variant="secondary">
                  {activity.mood}
                </Badge>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" onClick={handleEdit} className="h-8 w-8 p-0 bg-transparent">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRemove}
                  className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Activity Time
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl mb-2">{activity.icon}</div>
              <h3 className="text-lg font-semibold">{activity.name}</h3>
            </div>

            <div>
              <Label htmlFor="edit-time">Start Time</Label>
              <Input id="edit-time" type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Duration: {Math.floor(activity.duration / 60)}h {activity.duration % 60}m
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1">
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

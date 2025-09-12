"use client"

import { useState } from "react"
import { DndContext, type DragEndEvent, type DragOverEvent, DragOverlay, type DragStartEvent } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWeekendPlannerStore } from "@/lib/store"
import { WEEKEND_THEMES } from "@/lib/activities-data"
import { ActivityBrowser } from "./activity-browser"
import { DroppableDayColumn } from "./droppable-day-column"
import { ScheduleOverview } from "./schedule-overview"
import { ScheduleSuggestions } from "./schedule-suggestions"
import { MoodTracker } from "./mood-tracker"
import { ThemeCustomizer } from "./theme-customizer"
import { DraggableActivityCard } from "./draggable-activity-card"
import { PlanManager } from "./plan-manager"
import { ExportDialog } from "./export-dialog"
import type { Activity, ScheduledActivity } from "@/lib/types"
import { Sparkles, Save, LayoutGrid, List, Heart } from "lucide-react"

export function WeekendPlanner() {
  const {
    currentPlan,
    selectedTheme,
    createNewPlan,
    setTheme,
    savePlan,
    addActivityToSchedule,
    reorderActivities,
    moveActivityBetweenDays,
  } = useWeekendPlannerStore()

  const [showThemeSelector, setShowThemeSelector] = useState(!currentPlan)
  const [viewMode, setViewMode] = useState<"grid" | "overview" | "mood">("grid")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedActivity, setDraggedActivity] = useState<Activity | ScheduledActivity | null>(null)

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId)
    createNewPlan(themeId)
    setShowThemeSelector(false)
  }

  const handleSavePlan = () => {
    savePlan()
    // Could add toast notification here
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)

    // Determine what's being dragged
    if (event.active.data.current?.type === "activity") {
      setDraggedActivity(event.active.data.current.activity)
    } else {
      // Find the scheduled activity being dragged
      const activityId = (event.active.id as string).split("-")[0]
      const scheduledActivity = currentPlan
        ? [...currentPlan.saturday, ...currentPlan.sunday].find((a) => `${a.id}-${a.startTime}` === event.active.id)
        : null
      setDraggedActivity(scheduledActivity)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedActivity(null)

    if (!over || !currentPlan) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle dragging from activity browser to schedule
    if (activeId.startsWith("browser-") && (overId === "saturday" || overId === "sunday")) {
      const activity = active.data.current?.activity as Activity
      if (activity) {
        // Add to the beginning of the day or find a good time slot
        const dayActivities = currentPlan[overId]
        const startTime =
          dayActivities.length === 0
            ? "09:00"
            : dayActivities.sort((a, b) => a.startTime.localeCompare(b.startTime))[dayActivities.length - 1].endTime

        addActivityToSchedule(activity, overId, startTime)
      }
      return
    }

    // Handle reordering within the same day
    if (!activeId.startsWith("browser-") && !overId.startsWith("browser-")) {
      const activeActivity = [...currentPlan.saturday, ...currentPlan.sunday].find(
        (a) => `${a.id}-${a.startTime}` === activeId,
      )

      if (!activeActivity) return

      // Moving between days
      if ((overId === "saturday" || overId === "sunday") && activeActivity.day !== overId) {
        const newStartTime =
          currentPlan[overId].length === 0
            ? "09:00"
            : currentPlan[overId].sort((a, b) => a.startTime.localeCompare(b.startTime))[currentPlan[overId].length - 1]
                .endTime

        moveActivityBetweenDays(activeActivity.id, activeActivity.day, overId, newStartTime)
        return
      }

      // Reordering within the same day
      if (
        activeActivity.day === overId ||
        (currentPlan.saturday.some((a) => `${a.id}-${a.startTime}` === overId) && activeActivity.day === "saturday") ||
        (currentPlan.sunday.some((a) => `${a.id}-${a.startTime}` === overId) && activeActivity.day === "sunday")
      ) {
        const dayActivities = currentPlan[activeActivity.day]
        const oldIndex = dayActivities.findIndex((a) => `${a.id}-${a.startTime}` === activeId)
        const newIndex = dayActivities.findIndex((a) => `${a.id}-${a.startTime}` === overId)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          reorderActivities(activeActivity.day, oldIndex, newIndex)
        }
      }
    }
  }

  const selectedThemeData = WEEKEND_THEMES.find((theme) => theme.id === selectedTheme)

  if (showThemeSelector) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Weekendly
            </h1>
            <p className="text-lg text-muted-foreground">Plan your perfect weekend adventure</p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">Choose Your Weekend Vibe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {WEEKEND_THEMES.map((theme) => (
                  <Card
                    key={theme.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
                    onClick={() => handleThemeSelect(theme.id)}
                  >
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Badge className={theme.color + " mb-3"}>{theme.name}</Badge>
                        <p className="text-sm text-muted-foreground">{theme.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-7 w-7 text-primary" />
                Weekendly
              </h1>
              {selectedThemeData && <Badge className={selectedThemeData.color}>{selectedThemeData.name}</Badge>}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "outline"}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Grid
              </Button>
              <Button
                size="sm"
                variant={viewMode === "overview" ? "default" : "outline"}
                onClick={() => setViewMode("overview")}
              >
                <List className="h-4 w-4 mr-1" />
                Overview
              </Button>
              <Button
                size="sm"
                variant={viewMode === "mood" ? "default" : "outline"}
                onClick={() => setViewMode("mood")}
              >
                <Heart className="h-4 w-4 mr-1" />
                Mood
              </Button>
              <PlanManager />
              {currentPlan && <ExportDialog plan={currentPlan} />}
              <Button variant="outline" onClick={() => setShowThemeSelector(true)}>
                Change Theme
              </Button>
              <Button variant="outline" onClick={handleSavePlan}>
                <Save className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
              <Button onClick={() => createNewPlan(selectedTheme)}>New Plan</Button>
            </div>
          </div>

          {currentPlan && (
            <>
              {viewMode === "mood" ? (
                /* Mood & Theme Mode */
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2 space-y-6">
                    <MoodTracker plan={currentPlan} />
                    <ScheduleOverview plan={currentPlan} />
                  </div>
                  <div className="space-y-6">
                    <ThemeCustomizer plan={currentPlan} />
                    <ScheduleSuggestions plan={currentPlan} />
                  </div>
                </div>
              ) : viewMode === "overview" ? (
                /* Overview Mode */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <ScheduleOverview plan={currentPlan} />
                  </div>
                  <div className="space-y-6">
                    <ScheduleSuggestions plan={currentPlan} />
                    <ActivityBrowser />
                  </div>
                </div>
              ) : (
                /* Grid Mode with Drag and Drop */
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  {/* Schedule Display - Takes up 3 columns on xl screens */}
                  <div className="xl:col-span-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <DroppableDayColumn
                        day="saturday"
                        activities={currentPlan.saturday}
                        onAddActivity={() => {
                          // Could open activity browser or add dialog
                        }}
                      />
                      <DroppableDayColumn
                        day="sunday"
                        activities={currentPlan.sunday}
                        onAddActivity={() => {
                          // Could open activity browser or add dialog
                        }}
                      />
                    </div>
                  </div>

                  {/* Sidebar - Takes up 1 column on xl screens */}
                  <div className="xl:col-span-1 space-y-6">
                    <ScheduleSuggestions plan={currentPlan} />
                    <ActivityBrowser />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && draggedActivity ? (
          <div className="rotate-3 opacity-90">
            {activeId.startsWith("browser-") ? (
              <Card className="cursor-grabbing shadow-lg">
                <CardContent className="p-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{draggedActivity.icon}</div>
                    <h3 className="font-medium text-sm">{draggedActivity.name}</h3>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <DraggableActivityCard activity={draggedActivity as ScheduledActivity} />
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

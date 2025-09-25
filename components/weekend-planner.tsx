"use client"

import { useState, useEffect } from "react"
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
import { ParticleBackground } from "./particle-background"
import { TravelMode } from "./travel-mode"
import { MusicIntegration } from "./music-integration"
import type { Activity, ScheduledActivity } from "@/lib/types"
import { Sparkles, Save, LayoutGrid, List, Heart, Map, Music, Palette, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WeekendPlanner() {
  const { toast } = useToast()
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

  const [isMounted, setIsMounted] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(!currentPlan)
  const [viewMode, setViewMode] = useState<"grid" | "overview" | "mood">("grid")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedActivity, setDraggedActivity] = useState<Activity | ScheduledActivity | null>(null)
  const [showActivityBrowser, setShowActivityBrowser] = useState(true)
  const [showTravelMode, setShowTravelMode] = useState(false)
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)

  // Only enable drag and drop after client-side mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Add activity handler for dropdown
  const handleAddActivityFromDropdown = (day: "saturday" | "sunday") => (activity: Activity) => {
    if (!currentPlan) return;
    // Find a suitable start time (after last activity or 09:00)
    const dayActivities = currentPlan[day];
    const startTime =
      dayActivities.length === 0
        ? "09:00"
        : dayActivities.sort((a, b) => a.startTime.localeCompare(b.startTime))[dayActivities.length - 1].endTime;
    const result = addActivityToSchedule(activity, day, startTime);
    if (result?.rescheduled) {
      toast({
        title: "Activity Rescheduled",
        description: `${activity.name} was moved to ${result.newTime} to avoid conflicts.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Activity Added",
        description: `${activity.name} has been added to your ${day} schedule.`,
        variant: "default",
      });
    }
  }

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
      setDraggedActivity(scheduledActivity || null)
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

        const result = addActivityToSchedule(activity, overId, startTime)
        
        if (result?.rescheduled) {
          toast({
            title: "Activity Rescheduled",
            description: `${activity.name} was moved to ${result.newTime} to avoid conflicts.`,
            variant: "default",
          })
        } else {
          toast({
            title: "Activity Added",
            description: `${activity.name} has been added to your ${overId} schedule.`,
            variant: "default",
          })
        }
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
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
        {/* Particle Background */}
        <ParticleBackground />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-accent/10 to-primary/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16 pt-8 animate-slide-up">
            <div className="inline-flex items-center gap-3 glass-strong rounded-full px-6 py-3 mb-8 shadow-lg hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-6 w-6 text-primary animate-spin-slow" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ✨ Welcome to the Future of Weekend Planning
              </span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight animate-glow">
              Weekendly
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up delay-200">
              Transform your weekends into extraordinary adventures with our intelligent planning platform
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground animate-slide-up delay-300">
              <div className="flex items-center gap-2 glass rounded-full px-4 py-2 hover:scale-105 transition-transform duration-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                AI-Powered Suggestions
              </div>
              <div className="flex items-center gap-2 glass rounded-full px-4 py-2 hover:scale-105 transition-transform duration-200 delay-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                Drag & Drop Planning
              </div>
              <div className="flex items-center gap-2 glass rounded-full px-4 py-2 hover:scale-105 transition-transform duration-200 delay-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-400"></div>
                Smart Scheduling
              </div>
            </div>
          </div>

          {/* Theme Selection */}
          <div className="mb-20 animate-slide-up delay-400">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6 animate-pulse-gentle">
                <span className="text-2xl">✨</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Choose Your Perfect Weekend
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Discover your ideal weekend experience with our carefully curated themes, 
                <br className="hidden md:block" />
                each designed to match your unique mood and aspirations
              </p>
            </div>

            {/* Innovative Magazine-Style Grid Layout */}
            <div className="max-w-8xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-4 lg:gap-6">
                {WEEKEND_THEMES.map((theme, index) => {
                  // Creative magazine-style layout with unique proportions
                  const gridPatterns = [
                    "md:col-span-2 lg:col-span-3 xl:col-span-3 md:row-span-3", // Tall featured - Lazy Weekend
                    "md:col-span-1 lg:col-span-3 xl:col-span-5 md:row-span-2", // Ultra wide - Adventurous  
                    "md:col-span-1 lg:col-span-2 xl:col-span-2 md:row-span-2", // Tall narrow - Family
                    "md:col-span-2 lg:col-span-4 xl:col-span-3 md:row-span-1", // Wide short - Productive
                    "md:col-span-1 lg:col-span-2 xl:col-span-3 md:row-span-2", // Medium square - Social
                  ];
                  
                  const cardHeights = [
                    "h-[480px] md:h-[520px] lg:h-[580px]", // Extra tall hero
                    "h-[240px] md:h-[280px] lg:h-[320px]", // Medium height for wide card
                    "h-[320px] md:h-[380px] lg:h-[420px]", // Tall narrow
                    "h-[180px] md:h-[200px] lg:h-[220px]", // Short wide
                    "h-[300px] md:h-[340px] lg:h-[380px]", // Medium tall
                  ];

                  const imageHeights = [
                    "h-[280px] md:h-[320px] lg:h-[360px]", // Hero image - tall
                    "h-[140px] md:h-[160px] lg:h-[180px]", // Wide image - short
                    "h-[180px] md:h-[220px] lg:h-[260px]", // Narrow image - medium
                    "h-[100px] md:h-[120px] lg:h-[140px]", // Wide short image
                    "h-[160px] md:h-[200px] lg:h-[240px]", // Square image - medium
                  ];

                  const contentStyles = [
                    "p-6 lg:p-8", // Hero - more padding
                    "p-4 lg:p-6", // Wide - medium padding
                    "p-4 lg:p-6", // Narrow - medium padding  
                    "p-3 lg:p-4", // Short - less padding
                    "p-4 lg:p-6", // Square - medium padding
                  ];

                  const titleSizes = [
                    "text-2xl lg:text-3xl xl:text-4xl", // Hero - largest
                    "text-xl lg:text-2xl", // Wide - large
                    "text-lg lg:text-xl", // Narrow - medium
                    "text-base lg:text-lg", // Short - smaller
                    "text-lg lg:text-xl", // Square - medium
                  ];

                  return (
                    <Card
                      key={theme.id}
                      className={`group cursor-pointer border-0 overflow-hidden relative animate-slide-up transition-all duration-700 hover:scale-[1.03] hover:shadow-3xl backdrop-blur-sm ${gridPatterns[index]} ${cardHeights[index]}`}
                      onClick={() => handleThemeSelect(theme.id)}
                      style={{ 
                        animationDelay: `${600 + index * 120}ms`,
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: index === 0 ? '32px' : index === 1 ? '28px' : '20px',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {/* Sophisticated background with image */}
                      <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: index === 0 ? '32px' : index === 1 ? '28px' : '20px' }}>
                        <img 
                          src={theme.image} 
                          alt={theme.name}
                          className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110 ${
                            index === 1 ? 'object-left' : index === 3 ? 'object-center' : 'object-cover'
                          }`}
                        />
                        
                        {/* Adaptive gradient overlays based on card type */}
                        <div className={`absolute inset-0 ${
                          index === 0 ? 'bg-gradient-to-b from-transparent via-black/15 to-black/85' :
                          index === 1 ? 'bg-gradient-to-r from-black/70 via-black/30 to-transparent' :
                          index === 2 ? 'bg-gradient-to-b from-black/40 via-transparent to-black/70' :
                          index === 3 ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent' :
                          'bg-gradient-to-br from-black/60 via-transparent to-black/60'
                        }`}></div>
                        
                        <div 
                          className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-700"
                          style={{
                            background: index === 1 ? 
                              `linear-gradient(90deg, ${theme.primaryColor}40 0%, transparent 60%)` :
                              index === 3 ?
                              `linear-gradient(180deg, transparent 0%, ${theme.primaryColor}30 100%)` :
                              `radial-gradient(circle at ${index === 0 ? 'bottom left' : index === 2 ? 'top right' : 'center'}, ${theme.primaryColor}25 0%, transparent 70%)`
                          }}
                        ></div>
                      </div>

                      {/* Adaptive content layout */}
                      <div className={`relative h-full flex ${
                        index === 1 ? 'items-center justify-start' : 
                        index === 3 ? 'flex-col justify-end' :
                        'flex-col justify-between'
                      } ${contentStyles[index]} text-white z-10`}>
                        {/* Header section with adaptive positioning */}
                        <div className={`flex ${
                          index === 1 ? 'flex-col items-start' : 
                          index === 3 ? 'items-start justify-between mb-2' :
                          'items-start justify-between'
                        } ${index === 3 ? 'mb-2' : index === 1 ? 'mb-0' : 'mb-4'}`}>
                          {/* Icon with dynamic sizing */}
                          <div 
                            className={`flex items-center justify-center rounded-2xl backdrop-blur-xl border border-white/20 group-hover:scale-110 transition-all duration-500 shadow-lg ${
                              index === 0 ? 'w-16 h-16 lg:w-20 lg:h-20 group-hover:rotate-6' :
                              index === 1 ? 'w-14 h-14 lg:w-16 lg:h-16 group-hover:-rotate-3' :
                              index === 3 ? 'w-10 h-10 lg:w-12 lg:h-12 group-hover:rotate-12' : 
                              'w-12 h-12 lg:w-14 lg:h-14 group-hover:rotate-3'
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${theme.primaryColor}40, ${theme.accentColor}30)`,
                            }}
                          >
                            <span className={`filter drop-shadow-sm ${
                              index === 0 ? 'text-2xl lg:text-4xl' :
                              index === 3 ? 'text-lg lg:text-xl' :
                              'text-xl lg:text-2xl'
                            }`}>{theme.icon}</span>
                          </div>
                          
                          {/* Mood badge with conditional display */}
                          {theme.mood && (index !== 3) && (
                            <div 
                              className={`px-3 py-1 rounded-xl text-xs font-semibold backdrop-blur-xl border border-white/20 shadow-lg transition-all duration-300 ${
                                index === 1 ? 'mt-3' : ''
                              }`}
                              style={{
                                background: `linear-gradient(135deg, ${theme.primaryColor}50, ${theme.accentColor}40)`,
                                color: 'white'
                              }}
                            >
                              {theme.mood}
                            </div>
                          )}
                        </div>

                        {/* Title and description section */}
                        <div className={`${index === 1 ? 'mt-6' : index === 3 ? 'space-y-1' : 'space-y-2'}`}>
                          <h3 className={`font-bold leading-tight text-white drop-shadow-lg transition-all duration-300 group-hover:text-white group-hover:scale-105 ${titleSizes[index]}`}>
                            {theme.name}
                          </h3>
                          
                          <p className={`text-white/90 leading-relaxed drop-shadow-sm transition-all duration-300 group-hover:text-white ${
                            index === 0 ? 'text-base lg:text-lg' :
                            index === 3 ? 'text-xs lg:text-sm' :
                            'text-sm lg:text-base'
                          }`}>
                            {theme.description}
                          </p>

                          {/* Enhanced features for specific cards */}
                          {index === 0 && theme.vibe && (
                            <blockquote className="text-white/80 text-sm lg:text-base italic leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200 border-l-2 border-white/30 pl-4 mt-4">
                              "{theme.vibe}"
                            </blockquote>
                          )}

                          {(index === 0 || index === 1) && (
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-700 delay-300 space-y-2 mt-4">
                              <div className="text-white/90 text-xs font-medium">Featured activities:</div>
                              <div className="flex flex-wrap gap-2">
                                {theme.suggestedActivities.slice(0, index === 0 ? 4 : 3).map((activity) => (
                                  <span 
                                    key={activity} 
                                    className="px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-xl border border-white/20 shadow-sm"
                                    style={{
                                      background: `${theme.secondaryColor}30`,
                                      color: 'white'
                                    }}
                                  >
                                    {activity.replace('-', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Elegant hover indicator */}
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-400 mt-4">
                            <div 
                              className={`h-1 rounded-full transition-all duration-700 ${
                                index === 0 ? 'group-hover:w-20 w-10' :
                                index === 1 ? 'group-hover:w-16 w-8' :
                                index === 3 ? 'group-hover:w-8 w-4' :
                                'group-hover:w-12 w-6'
                              }`}
                              style={{
                                background: `linear-gradient(90deg, ${theme.primaryColor}, ${theme.accentColor})`
                              }}
                            ></div>
                            {index !== 3 && <span className="text-white/70 text-xs">Click to explore</span>}
                          </div>
                        </div>
                      </div>

                      {/* Premium glow effect */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                        style={{
                          borderRadius: index === 0 ? '32px' : index === 1 ? '28px' : '20px',
                          boxShadow: `0 0 ${index === 0 ? '60px' : index === 1 ? '50px' : '30px'} ${theme.primaryColor}20`,
                          filter: 'blur(20px)'
                        }}
                      ></div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Features showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16 animate-slide-up delay-1000">
            <div className="text-center p-6 rounded-2xl glass border border-white/20 hover:scale-105 transition-transform duration-300 group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center group-hover:animate-bounce-subtle shadow-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Personalized</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Tailored recommendations based on your preferences and mood</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl glass border border-white/20 hover:scale-105 transition-transform duration-300 group delay-100">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center group-hover:animate-bounce-subtle shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Intelligent</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">AI-powered suggestions that learn from your preferences</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl glass border border-white/20 hover:scale-105 transition-transform duration-300 group delay-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center group-hover:animate-bounce-subtle shadow-lg">
                <Save className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-lg">Effortless</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Simple drag-and-drop interface for seamless planning</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {!isMounted ? (
        <div 
          className="min-h-screen p-4"
          style={{
            background: selectedThemeData 
              ? `linear-gradient(to bottom right, ${selectedThemeData.primaryColor}10, ${selectedThemeData.secondaryColor}10, ${selectedThemeData.accentColor}05)`
              : undefined
          }}
        >
          {/* Particle Background */}
          <ParticleBackground />
          
          {/* Static version for SSR */}
          <div className="max-w-7xl mx-auto">
            <header className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Weekend Planner
                </h1>
                <Button variant="outline" onClick={() => setViewMode(viewMode === "grid" ? "overview" : "grid")}>
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                </Button>
              </div>
            </header>
            <div className="text-center py-20 text-muted-foreground">
              Loading interactive features...
            </div>
          </div>
        </div>
      ) : (
        <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div 
        className="min-h-screen p-4"
        style={{
          background: selectedThemeData 
            ? `linear-gradient(to bottom right, ${selectedThemeData.primaryColor}10, ${selectedThemeData.secondaryColor}10, ${selectedThemeData.accentColor}05)`
            : undefined
        }}
      >
        {/* Particle Background */}
        <ParticleBackground />
        
        {/* Animated background elements for themed consistency */}
        {selectedThemeData && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div 
              className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl animate-pulse opacity-20"
              style={{ background: `linear-gradient(to right, ${selectedThemeData.primaryColor}, ${selectedThemeData.secondaryColor})` }}
            ></div>
            <div 
              className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 opacity-20"
              style={{ background: `linear-gradient(to right, ${selectedThemeData.secondaryColor}, ${selectedThemeData.accentColor})` }}
            ></div>
            <div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-2xl animate-pulse delay-500 opacity-10"
              style={{ background: `linear-gradient(to right, ${selectedThemeData.accentColor}, ${selectedThemeData.primaryColor})` }}
            ></div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Professional Header with improved layout */}
          <header className="mb-8">
            {/* Top section with branding and theme indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-sm border border-primary/20 shadow-lg">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent animate-pulse delay-1000"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text">
                      Weekendly
                    </h1>
                    <p className="text-sm text-muted-foreground hidden sm:block font-medium">
                      Smart Weekend Planning
                    </p>
                  </div>
                </div>
                {selectedThemeData && (
                  <div className="hidden md:flex items-center gap-2 bg-background/50 backdrop-blur-sm border rounded-full px-3 py-1.5 shadow-sm">
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm animate-pulse"
                      style={{ backgroundColor: selectedThemeData.primaryColor }}
                    />
                    <Badge variant="secondary" className="text-xs border-0 bg-transparent">
                      {selectedThemeData.name}
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Quick actions with professional styling */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowThemeSelector(true)} 
                  className="hidden sm:flex rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Themes
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSavePlan}
                  className="rounded-xl border-green-500/20 hover:border-green-500/40 hover:bg-green-500/5 transition-all duration-200"
                >
                  <Save className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => createNewPlan(selectedTheme)}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">New Plan</span>
                </Button>
              </div>
            </div>

            {/* Navigation tabs with enhanced styling */}
            <div className="bg-background/80 backdrop-blur-sm border rounded-2xl p-1.5 shadow-lg hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
              {/* Subtle gradient overlay for premium feel */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent"></div>
              
              <div className="flex flex-wrap items-center justify-between gap-1 relative z-10">
                {/* Primary navigation with improved grouping */}
                <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-0.5">
                  <Button
                    size="sm"
                    variant={showActivityBrowser ? "default" : "ghost"}
                    onClick={() => setShowActivityBrowser(!showActivityBrowser)}
                    className="lg:hidden rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    Activities
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "grid" && !showTravelMode && !showMusicPlayer ? "default" : "ghost"}
                    onClick={() => {
                      setViewMode("grid")
                      setShowTravelMode(false)
                      setShowMusicPlayer(false)
                    }}
                    className="rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Grid</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "overview" && !showTravelMode && !showMusicPlayer ? "default" : "ghost"}
                    onClick={() => {
                      setViewMode("overview")
                      setShowTravelMode(false)
                      setShowMusicPlayer(false)
                    }}
                    className="rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <List className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Overview</span>
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "mood" && !showTravelMode && !showMusicPlayer ? "default" : "ghost"}
                    onClick={() => {
                      setViewMode("mood")
                      setShowTravelMode(false)
                      setShowMusicPlayer(false)
                    }}
                    className="rounded-lg transition-all duration-200 hover:scale-105"
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Mood</span>
                  </Button>
                </div>

                {/* Feature buttons with enhanced styling */}
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-0.5">
                    <Button
                      size="sm"
                      variant={showTravelMode ? "default" : "ghost"}
                      onClick={() => {
                        setShowTravelMode(!showTravelMode)
                        if (!showTravelMode) {
                          setShowMusicPlayer(false)
                        }
                      }}
                      className="rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Map className="h-4 w-4 mr-1" />
                      <span className="hidden md:inline">Map</span>
                    </Button>
                    <Button
                      size="sm"
                      variant={showMusicPlayer ? "default" : "ghost"}
                      onClick={() => {
                        setShowMusicPlayer(!showMusicPlayer)
                        if (!showMusicPlayer) {
                          setShowTravelMode(false)
                        }
                      }}
                      className="rounded-lg transition-all duration-200 hover:scale-105"
                    >
                      <Music className="h-4 w-4 mr-1" />
                      <span className="hidden md:inline">Music</span>
                    </Button>
                  </div>
                  <div className="h-6 w-px bg-border mx-2" />
                  <div className="flex items-center gap-1">
                    <PlanManager />
                    {currentPlan && <ExportDialog plan={currentPlan} />}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {currentPlan && (
            <>
              {showTravelMode ? (
                /* Travel Mode with Map Integration */
                <div className="space-y-6">
                  <TravelMode activities={[...currentPlan.saturday, ...currentPlan.sunday]} />
                </div>
              ) : showMusicPlayer ? (
                /* Music Integration Mode */
                <div className="space-y-6">
                  <MusicIntegration activities={[...currentPlan.saturday, ...currentPlan.sunday]} />
                </div>
              ) : viewMode === "mood" ? (
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
                /* Grid Mode with Drag and Drop - Optimized Layout */
                <div className="space-y-6 lg:space-y-0">
                  {/* Mobile Activity Browser Toggle */}
                  <div className={`lg:hidden ${showActivityBrowser ? 'block' : 'hidden'}`}>
                    <div className="bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg p-1 mb-6">
                      <ActivityBrowser />
                    </div>
                  </div>
                  
                  {/* Main Grid Layout - Improved Proportions */}
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Desktop Sidebar with Activity Browser - Increased width */}
                    <div className="hidden lg:block lg:col-span-2">
                      <div className="space-y-6">
                        <div className="bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg p-1">
                          <ActivityBrowser />
                        </div>
                        <ScheduleSuggestions plan={currentPlan} />
                      </div>
                    </div>
                    
                    {/* Schedule Display - Reduced width for better balance */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                        <DroppableDayColumn
                          day="saturday"
                          activities={currentPlan.saturday}
                          onAddActivity={handleAddActivityFromDropdown("saturday")}
                        />
                        <DroppableDayColumn
                          day="sunday"
                          activities={currentPlan.sunday}
                          onAddActivity={handleAddActivityFromDropdown("sunday")}
                        />
                      </div>
                    </div>
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
          <div className="rotate-3 opacity-95 scale-110 filter drop-shadow-2xl">
            {activeId.startsWith("browser-") ? (
              <Card className="cursor-grabbing shadow-2xl ring-2 ring-primary bg-background border-primary">
                <CardContent className="p-3">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{draggedActivity.icon}</div>
                    <h3 className="font-medium text-sm">{draggedActivity.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Math.floor(draggedActivity.duration / 60)}h{draggedActivity.duration % 60 > 0 ? ` ${draggedActivity.duration % 60}m` : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="transform scale-105">
                <DraggableActivityCard activity={draggedActivity as ScheduledActivity} />
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
      )}
    </>
  )
}

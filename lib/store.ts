import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WeekendPlan, ScheduledActivity, Activity, MoodEntry } from "./types"

interface WeekendPlannerStore {
  currentPlan: WeekendPlan | null
  savedPlans: WeekendPlan[]
  selectedTheme: string

  // Actions
  createNewPlan: (theme: string) => void
  addActivityToSchedule: (activity: Activity, day: "saturday" | "sunday", startTime: string) => void
  removeActivityFromSchedule: (activityId: string, day: "saturday" | "sunday") => void
  updateActivityTime: (activityId: string, day: "saturday" | "sunday", startTime: string) => void
  reorderActivities: (day: "saturday" | "sunday", oldIndex: number, newIndex: number) => void
  moveActivityBetweenDays: (
    activityId: string,
    fromDay: "saturday" | "sunday",
    toDay: "saturday" | "sunday",
    newStartTime: string,
  ) => void
  updatePlanMood: (planId: string, mood: string, moodEntry: MoodEntry) => void
  updateThemeColors: (planId: string, colors: { primary: string; secondary: string; accent: string }) => void
  deletePlan: (planId: string) => void
  duplicatePlan: (planId: string) => void
  updatePlanName: (planId: string, name: string) => void
  importPlan: (planData: WeekendPlan) => void
  savePlan: () => void
  loadPlan: (planId: string) => void
  setTheme: (theme: string) => void
  clearCurrentPlan: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const calculateEndTime = (startTime: string, duration: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMins = totalMinutes % 60
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
}

export const useWeekendPlannerStore = create<WeekendPlannerStore>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      savedPlans: [],
      selectedTheme: "lazy",

      createNewPlan: (theme: string) => {
        const newPlan: WeekendPlan = {
          id: generateId(),
          name: `Weekend Plan - ${new Date().toLocaleDateString()}`,
          theme: theme as any,
          saturday: [],
          sunday: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set({ currentPlan: newPlan, selectedTheme: theme })
      },

      addActivityToSchedule: (activity: Activity, day: "saturday" | "sunday", startTime: string) => {
        const { currentPlan } = get()
        if (!currentPlan) return

        const endTime = calculateEndTime(startTime, activity.duration)
        const scheduledActivity: ScheduledActivity = {
          ...activity,
          day,
          startTime,
          endTime,
        }

        const updatedPlan = {
          ...currentPlan,
          [day]: [...currentPlan[day], scheduledActivity],
          updatedAt: new Date(),
        }

        set({ currentPlan: updatedPlan })
      },

      removeActivityFromSchedule: (activityId: string, day: "saturday" | "sunday") => {
        const { currentPlan } = get()
        if (!currentPlan) return

        const updatedPlan = {
          ...currentPlan,
          [day]: currentPlan[day].filter((activity) => activity.id !== activityId),
          updatedAt: new Date(),
        }

        set({ currentPlan: updatedPlan })
      },

      updateActivityTime: (activityId: string, day: "saturday" | "sunday", startTime: string) => {
        const { currentPlan } = get()
        if (!currentPlan) return

        const updatedActivities = currentPlan[day].map((activity) => {
          if (activity.id === activityId) {
            return {
              ...activity,
              startTime,
              endTime: calculateEndTime(startTime, activity.duration),
            }
          }
          return activity
        })

        const updatedPlan = {
          ...currentPlan,
          [day]: updatedActivities,
          updatedAt: new Date(),
        }

        set({ currentPlan: updatedPlan })
      },

      reorderActivities: (day: "saturday" | "sunday", oldIndex: number, newIndex: number) => {
        const { currentPlan } = get()
        if (!currentPlan) return

        const activities = [...currentPlan[day]]
        const [reorderedItem] = activities.splice(oldIndex, 1)
        activities.splice(newIndex, 0, reorderedItem)

        // Recalculate times based on new order
        const sortedActivities = activities.sort((a, b) => a.startTime.localeCompare(b.startTime))
        const currentTime = sortedActivities[0]?.startTime || "09:00"

        const updatedActivities = sortedActivities.map((activity, index) => {
          if (index === 0) {
            return activity
          }

          const prevActivity = sortedActivities[index - 1]
          const newStartTime = prevActivity.endTime
          return {
            ...activity,
            startTime: newStartTime,
            endTime: calculateEndTime(newStartTime, activity.duration),
          }
        })

        const updatedPlan = {
          ...currentPlan,
          [day]: updatedActivities,
          updatedAt: new Date(),
        }

        set({ currentPlan: updatedPlan })
      },

      moveActivityBetweenDays: (
        activityId: string,
        fromDay: "saturday" | "sunday",
        toDay: "saturday" | "sunday",
        newStartTime: string,
      ) => {
        const { currentPlan } = get()
        if (!currentPlan) return

        const activityToMove = currentPlan[fromDay].find((activity) => activity.id === activityId)
        if (!activityToMove) return

        const updatedFromDay = currentPlan[fromDay].filter((activity) => activity.id !== activityId)
        const updatedActivity = {
          ...activityToMove,
          day: toDay,
          startTime: newStartTime,
          endTime: calculateEndTime(newStartTime, activityToMove.duration),
        }
        const updatedToDay = [...currentPlan[toDay], updatedActivity]

        const updatedPlan = {
          ...currentPlan,
          [fromDay]: updatedFromDay,
          [toDay]: updatedToDay,
          updatedAt: new Date(),
        }

        set({ currentPlan: updatedPlan })
      },

      updatePlanMood: (planId: string, mood: string, moodEntry: MoodEntry) => {
        const { currentPlan, savedPlans } = get()

        // Update current plan if it matches
        if (currentPlan && currentPlan.id === planId) {
          const updatedPlan = {
            ...currentPlan,
            overallMood: mood as any,
            moodJournal: [...(currentPlan.moodJournal || []), moodEntry],
            updatedAt: new Date(),
          }
          set({ currentPlan: updatedPlan })
        }

        // Update saved plans
        const updatedSavedPlans = savedPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              overallMood: mood as any,
              moodJournal: [...(plan.moodJournal || []), moodEntry],
              updatedAt: new Date(),
            }
          }
          return plan
        })

        set({ savedPlans: updatedSavedPlans })
      },

      updateThemeColors: (planId: string, colors: { primary: string; secondary: string; accent: string }) => {
        const { currentPlan, savedPlans } = get()

        // Update current plan if it matches
        if (currentPlan && currentPlan.id === planId) {
          const updatedPlan = {
            ...currentPlan,
            customThemeColors: colors,
            updatedAt: new Date(),
          }
          set({ currentPlan: updatedPlan })
        }

        // Update saved plans
        const updatedSavedPlans = savedPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              customThemeColors: colors,
              updatedAt: new Date(),
            }
          }
          return plan
        })

        set({ savedPlans: updatedSavedPlans })
      },

      deletePlan: (planId: string) => {
        const { savedPlans, currentPlan } = get()
        const updatedPlans = savedPlans.filter((plan) => plan.id !== planId)

        // If deleting current plan, clear it
        const updatedCurrentPlan = currentPlan?.id === planId ? null : currentPlan

        set({ savedPlans: updatedPlans, currentPlan: updatedCurrentPlan })
      },

      duplicatePlan: (planId: string) => {
        const { savedPlans } = get()
        const planToDuplicate = savedPlans.find((plan) => plan.id === planId)

        if (planToDuplicate) {
          const duplicatedPlan: WeekendPlan = {
            ...planToDuplicate,
            id: generateId(),
            name: `${planToDuplicate.name} (Copy)`,
            createdAt: new Date(),
            updatedAt: new Date(),
            moodJournal: [], // Reset mood journal for duplicate
          }

          set({ savedPlans: [...savedPlans, duplicatedPlan] })
        }
      },

      updatePlanName: (planId: string, name: string) => {
        const { currentPlan, savedPlans } = get()

        // Update current plan if it matches
        if (currentPlan && currentPlan.id === planId) {
          const updatedPlan = {
            ...currentPlan,
            name,
            updatedAt: new Date(),
          }
          set({ currentPlan: updatedPlan })
        }

        // Update saved plans
        const updatedSavedPlans = savedPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              name,
              updatedAt: new Date(),
            }
          }
          return plan
        })

        set({ savedPlans: updatedSavedPlans })
      },

      importPlan: (planData: WeekendPlan) => {
        const { savedPlans } = get()
        const importedPlan: WeekendPlan = {
          ...planData,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set({
          savedPlans: [...savedPlans, importedPlan],
          currentPlan: importedPlan,
          selectedTheme: importedPlan.theme,
        })
      },

      savePlan: () => {
        const { currentPlan, savedPlans } = get()
        if (!currentPlan) return

        const existingIndex = savedPlans.findIndex((plan) => plan.id === currentPlan.id)
        let updatedPlans

        if (existingIndex >= 0) {
          updatedPlans = [...savedPlans]
          updatedPlans[existingIndex] = currentPlan
        } else {
          updatedPlans = [...savedPlans, currentPlan]
        }

        set({ savedPlans: updatedPlans })
      },

      loadPlan: (planId: string) => {
        const { savedPlans } = get()
        const plan = savedPlans.find((p) => p.id === planId)
        if (plan) {
          set({ currentPlan: plan, selectedTheme: plan.theme })
        }
      },

      setTheme: (theme: string) => {
        set({ selectedTheme: theme })
      },

      clearCurrentPlan: () => {
        set({ currentPlan: null })
      },
    }),
    {
      name: "weekend-planner-storage",
      partialize: (state) => ({ savedPlans: state.savedPlans }),
    },
  ),
)

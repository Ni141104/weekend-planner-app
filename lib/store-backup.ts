import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WeekendPlan, ScheduledActivity, Activity, MoodEntry } from "./types"

interface WeekendPlannerStore {
  currentPlan: WeekendPlan | null
  savedPlans: WeekendPlan[]
  selectedTheme: string
  customActivities: Activity[] // User-created custom activities

  // Actions
  createNewPlan: (theme: string) => void
  addActivityToSchedule: (activity: Activity, day: "saturday" | "sunday", startTime: string) => { success: boolean; rescheduled: boolean; newTime?: string } | undefined
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
  addCustomActivity: (activity: Activity) => void // Add custom activity
  removeCustomActivity: (activityId: string) => void // Remove custom activity
}

const generateId = () => {
  if (typeof window !== 'undefined') {
    return Math.random().toString(36).substr(2, 9)
  }
  // Fallback for SSR - use a deterministic ID
  return 'ssr-' + Date.now().toString(36)
}

const getCurrentDate = () => {
  return typeof window !== 'undefined' ? new Date() : new Date('2025-09-14')
}

const calculateEndTime = (startTime: string, duration: number): string => {
  const [hours, minutes] = startTime.split(":").map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  const endHours = Math.floor(totalMinutes / 60) % 24
  const endMins = totalMinutes % 60
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60) % 24
  const mins = minutes % 60
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`
}

const hasTimeConflict = (
  existingActivities: ScheduledActivity[],
  newStartTime: string,
  newDuration: number,
  excludeActivityId?: string
): boolean => {
  const newStart = timeToMinutes(newStartTime)
  const newEnd = newStart + newDuration

  return existingActivities.some(activity => {
    if (excludeActivityId && activity.id === excludeActivityId) return false
    
    const activityStart = timeToMinutes(activity.startTime)
    const activityEnd = timeToMinutes(activity.endTime)
    
    // Check if times overlap
    return (newStart < activityEnd && newEnd > activityStart)
  })
}

const findNextAvailableTime = (
  existingActivities: ScheduledActivity[],
  preferredStartTime: string,
  duration: number,
  excludeActivityId?: string
): string => {
  const sortedActivities = existingActivities
    .filter(activity => !excludeActivityId || activity.id !== excludeActivityId)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  let proposedStart = timeToMinutes(preferredStartTime)
  const proposedEnd = proposedStart + duration

  for (const activity of sortedActivities) {
    const activityStart = timeToMinutes(activity.startTime)
    const activityEnd = timeToMinutes(activity.endTime)

    // If the proposed time conflicts with this activity
    if (proposedStart < activityEnd && proposedEnd > activityStart) {
      // Move the proposed start time to after this activity
      proposedStart = activityEnd
    }
  }

  // Ensure we don't go past midnight
  if (proposedStart + duration > 24 * 60) {
    proposedStart = Math.max(0, 24 * 60 - duration)
  }

  return minutesToTime(proposedStart)
}

export const useWeekendPlannerStore = create<WeekendPlannerStore>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      savedPlans: [
        {
          id: "demo-adventurous",
          name: "Adventure Weekend",
          theme: "adventurous",
          saturday: [
            {
              id: "hiking",
              name: "Hiking",
              category: "outdoor",
              duration: 180,
              icon: "🥾",
              description: "Explore nature trails and enjoy fresh air",
              mood: "adventurous",
              startTime: "08:00",
              endTime: "11:00",
              day: "saturday",
              isCustom: false
            },
            {
              id: "brunch",
              name: "Brunch",
              category: "food",
              duration: 120,
              icon: "🥞",
              description: "Late morning meal with friends",
              mood: "happy",
              startTime: "12:00",
              endTime: "14:00",
              day: "saturday",
              isCustom: false
            },
            {
              id: "cycling",
              name: "Cycling",
              category: "outdoor",
              duration: 120,
              icon: "🚴",
              description: "Bike ride through scenic routes",
              mood: "energetic",
              startTime: "15:00",
              endTime: "17:00",
              day: "saturday",
              isCustom: false
            }
          ],
          sunday: [
            {
              id: "yoga",
              name: "Yoga",
              category: "wellness",
              duration: 60,
              icon: "🧘",
              description: "Mindful movement and stretching",
              mood: "relaxed",
              startTime: "09:00",
              endTime: "10:00",
              day: "sunday",
              isCustom: false
            },
            {
              id: "picnic",
              name: "Picnic",
              category: "outdoor",
              duration: 150,
              icon: "🧺",
              description: "Outdoor meal in a beautiful setting",
              mood: "relaxed",
              startTime: "11:00",
              endTime: "13:30",
              day: "sunday",
              isCustom: false
            },
            {
              id: "museum",
              name: "Museum Visit",
              category: "entertainment",
              duration: 150,
              icon: "�️",
              description: "Explore art and history exhibitions",
              mood: "adventurous",
              startTime: "15:00",
              endTime: "17:30",
              day: "sunday",
              isCustom: false
            }
          ],
          createdAt: new Date('2025-09-10'),
          updatedAt: new Date('2025-09-12')
        },
        {
          id: "demo-relaxed", 
          name: "Peaceful Pune Retreat",
          theme: "lazy",
          saturday: [
            {
              id: "shaniwar-wada",
              name: "Shaniwar Wada",
              category: "entertainment",
              duration: 120,
              icon: "🏛️",
              description: "Historic palace with peaceful gardens and Maratha history",
              mood: "relaxed",
              startTime: "09:00",
              endTime: "11:00",
              day: "saturday",
              isCustom: false
            },
            {
              id: "dagdusheth-temple",
              name: "Dagdusheth Ganpati Temple",
              category: "wellness",
              duration: 60,
              icon: "�️",
              description: "Serene temple for peaceful meditation and prayers",
              mood: "relaxed",
              startTime: "14:00",
              endTime: "15:00",
              day: "saturday",
              isCustom: false
            }
          ],
          sunday: [
            {
              id: "pune-okayama-park",
              name: "Pune Okayama Friendship Garden",
              category: "outdoor",
              duration: 120,
              icon: "🌸",
              description: "Japanese-style garden perfect for peaceful morning walks",
              mood: "relaxed",
              startTime: "08:00",
              endTime: "10:00",
              day: "sunday",
              isCustom: false
            },
            {
              id: "pashan-lake",
              name: "Pashan Lake",
              category: "outdoor",
              duration: 90,
              icon: "�️",
              description: "Tranquil lake for bird watching and sunset views",
              mood: "relaxed",
              startTime: "16:00",
              endTime: "17:30",
              day: "sunday",
              isCustom: false
            }
          ],
          createdAt: new Date('2025-09-08'),
          updatedAt: new Date('2025-09-10')
        }
      ],
      selectedTheme: "lazy",
      customActivities: [
        {
          id: "custom-pottery",
          name: "Pottery Workshop",
          category: "entertainment",
          duration: 150,
          icon: "🏺",
          description: "Learn pottery basics in a relaxing creative environment",
          mood: "happy",
          isCustom: true
        },
        {
          id: "custom-photography",
          name: "Sunset Photography Walk",
          category: "outdoor",
          duration: 90,
          icon: "📸",
          description: "Capture beautiful sunset moments around the city",
          mood: "adventurous", 
          isCustom: true
        },
        {
          id: "custom-wine-tasting",
          name: "Local Wine Tasting",
          category: "food",
          duration: 120,
          icon: "🍷",
          description: "Discover local wines at the boutique winery",
          mood: "relaxed",
          isCustom: true
        }
      ],

      createNewPlan: (theme: string) => {
        const now = getCurrentDate()
        const newPlan: WeekendPlan = {
          id: generateId(),
          name: `Weekend Plan - ${now.toLocaleDateString()}`,
          theme: theme as any,
          saturday: [
            {
              id: "shaniwar-wada",
              name: "Shaniwar Wada",
              category: "entertainment",
              duration: 90,
              icon: "🏰",
              description: "Historic fortification and palace ruins in Pune city center",
              mood: "adventurous",
              startTime: "09:00",
              endTime: "10:30",
              day: "saturday",
              isCustom: false
            },
            {
              id: "fc-road",
              name: "FC Road Food Walk",
              category: "food",
              duration: 150,
              icon: "�",
              description: "Street food paradise on Fergusson College Road",
              mood: "happy",
              startTime: "12:00",
              endTime: "14:30",
              day: "saturday",
              isCustom: false
            },
            {
              id: "aga-khan-palace",
              name: "Aga Khan Palace",
              category: "entertainment",
              duration: 120,
              icon: "🏛️",
              description: "Beautiful Italianate arches and lush gardens with Gandhi history",
              mood: "relaxed",
              startTime: "15:30",
              endTime: "17:30",
              day: "saturday",
              isCustom: false
            }
          ],
          sunday: [
            {
              id: "sinhagad-fort",
              name: "Sinhagad Fort",
              category: "outdoor",
              duration: 240,
              icon: "⛰️",
              description: "Ancient hill fortress with trekking trails and panoramic views",
              mood: "adventurous",
              startTime: "08:00",
              endTime: "12:00",
              day: "sunday",
              isCustom: false
            },
            {
              id: "koregaon-park",
              name: "Koregaon Park",
              category: "social",
              duration: 120,
              icon: "🍸",
              description: "Trendy area with cafes, pubs, and vibrant nightlife",
              mood: "energetic",
              startTime: "14:00",
              endTime: "16:00",
              day: "sunday",
              isCustom: false
            },
            {
              id: "pune-okayama-park",
              name: "Pune-Okayama Park",
              category: "wellness",
              duration: 90,
              icon: "�",
              description: "Japanese-style garden with cherry blossoms and zen atmosphere",
              mood: "relaxed",
              startTime: "17:00",
              endTime: "18:30",
              day: "sunday",
              isCustom: false
            }
          ],
          createdAt: now,
          updatedAt: now,
        }
        set({ currentPlan: newPlan, selectedTheme: theme })
      },

      addActivityToSchedule: (activity: Activity, day: "saturday" | "sunday", startTime: string) => {
        const { currentPlan } = get()
        if (!currentPlan) return { success: false, rescheduled: false }

        // Check for conflicts and find the best available time
        let finalStartTime = startTime
        let wasRescheduled = false
        
        if (hasTimeConflict(currentPlan[day], startTime, activity.duration)) {
          finalStartTime = findNextAvailableTime(currentPlan[day], startTime, activity.duration)
          wasRescheduled = true
        }

        const endTime = calculateEndTime(finalStartTime, activity.duration)
        const scheduledActivity: ScheduledActivity = {
          ...activity,
          day,
          startTime: finalStartTime,
          endTime,
        }

        const updatedPlan = {
          ...currentPlan,
          [day]: [...currentPlan[day], scheduledActivity].sort((a, b) => 
            timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
          ),
          updatedAt: getCurrentDate(),
        }

        set({ currentPlan: updatedPlan })
        return { success: true, rescheduled: wasRescheduled, newTime: finalStartTime }
      },

      removeActivityFromSchedule: (activityId: string, day: "saturday" | "sunday") => {
        const { currentPlan } = get()
        if (!currentPlan) return

        const updatedPlan = {
          ...currentPlan,
          [day]: currentPlan[day].filter((activity) => activity.id !== activityId),
          updatedAt: getCurrentDate(),
        }

        set({ currentPlan: updatedPlan })
      },

      updateActivityTime: (activityId: string, day: "saturday" | "sunday", startTime: string) => {
        const { currentPlan } = get()
        if (!currentPlan) return

        const activityToUpdate = currentPlan[day].find((activity) => activity.id === activityId)
        if (!activityToUpdate) return

        // Check for conflicts and find the best available time (excluding the current activity)
        let finalStartTime = startTime
        if (hasTimeConflict(currentPlan[day], startTime, activityToUpdate.duration, activityId)) {
          finalStartTime = findNextAvailableTime(currentPlan[day], startTime, activityToUpdate.duration, activityId)
        }

        const updatedActivities = currentPlan[day].map((activity) => {
          if (activity.id === activityId) {
            return {
              ...activity,
              startTime: finalStartTime,
              endTime: calculateEndTime(finalStartTime, activity.duration),
            }
          }
          return activity
        }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

        const updatedPlan = {
          ...currentPlan,
          [day]: updatedActivities,
          updatedAt: getCurrentDate(),
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
          updatedAt: getCurrentDate(),
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

        // Check for conflicts in the target day and find the best available time
        let finalStartTime = newStartTime
        if (hasTimeConflict(currentPlan[toDay], newStartTime, activityToMove.duration)) {
          finalStartTime = findNextAvailableTime(currentPlan[toDay], newStartTime, activityToMove.duration)
        }

        const updatedFromDay = currentPlan[fromDay].filter((activity) => activity.id !== activityId)
        const updatedActivity = {
          ...activityToMove,
          day: toDay,
          startTime: finalStartTime,
          endTime: calculateEndTime(finalStartTime, activityToMove.duration),
        }
        
        const updatedToDay = [...currentPlan[toDay], updatedActivity].sort((a, b) => 
          timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
        )

        const updatedPlan = {
          ...currentPlan,
          [fromDay]: updatedFromDay,
          [toDay]: updatedToDay,
          updatedAt: getCurrentDate(),
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
            updatedAt: getCurrentDate(),
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
              updatedAt: getCurrentDate(),
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
            updatedAt: getCurrentDate(),
          }
          set({ currentPlan: updatedPlan })
        }

        // Update saved plans
        const updatedSavedPlans = savedPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              customThemeColors: colors,
              updatedAt: getCurrentDate(),
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
            createdAt: getCurrentDate(),
            updatedAt: getCurrentDate(),
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
            updatedAt: getCurrentDate(),
          }
          set({ currentPlan: updatedPlan })
        }

        // Update saved plans
        const updatedSavedPlans = savedPlans.map((plan) => {
          if (plan.id === planId) {
            return {
              ...plan,
              name,
              updatedAt: getCurrentDate(),
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
          createdAt: getCurrentDate(),
          updatedAt: getCurrentDate(),
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

      addCustomActivity: (activity: Activity) => {
        const { customActivities } = get()
        set({ customActivities: [...customActivities, activity] })
      },

      removeCustomActivity: (activityId: string) => {
        const { customActivities } = get()
        set({ customActivities: customActivities.filter(activity => activity.id !== activityId) })
      },
    }),
    {
      name: "weekend-planner-storage",
      partialize: (state) => ({ savedPlans: state.savedPlans }),
    },
  ),
)

import { renderHook, act } from "@testing-library/react"
import { useWeekendPlannerStore } from "@/lib/store"
import type { Activity } from "@/lib/types"

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
})

describe("WeekendPlannerStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useWeekendPlannerStore.getState().clearCurrentPlan()
    useWeekendPlannerStore.setState({ savedPlans: [], selectedTheme: "lazy" })
  })

  describe("Plan Management", () => {
    it("should create a new plan", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      act(() => {
        result.current.createNewPlan("adventurous")
      })

      expect(result.current.currentPlan).toBeTruthy()
      expect(result.current.currentPlan?.theme).toBe("adventurous")
      expect(result.current.selectedTheme).toBe("adventurous")
    })

    it("should save and load plans", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      // Create and save a plan
      act(() => {
        result.current.createNewPlan("lazy")
        result.current.savePlan()
      })

      const planId = result.current.currentPlan?.id
      expect(result.current.savedPlans).toHaveLength(1)

      // Clear current plan and load it back
      act(() => {
        result.current.clearCurrentPlan()
      })

      expect(result.current.currentPlan).toBeNull()

      act(() => {
        result.current.loadPlan(planId!)
      })

      expect(result.current.currentPlan).toBeTruthy()
      expect(result.current.currentPlan?.id).toBe(planId)
    })
  })

  describe("Activity Management", () => {
    const mockActivity: Activity = {
      id: "test-activity",
      name: "Test Activity",
      category: "outdoor",
      duration: 120,
      icon: "🏃",
      description: "A test activity",
      mood: "energetic",
    }

    beforeEach(() => {
      const { result } = renderHook(() => useWeekendPlannerStore())
      act(() => {
        result.current.createNewPlan("lazy")
      })
    })

    it("should add activity to schedule", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      act(() => {
        result.current.addActivityToSchedule(mockActivity, "saturday", "09:00")
      })

      expect(result.current.currentPlan?.saturday).toHaveLength(1)
      expect(result.current.currentPlan?.saturday[0].name).toBe("Test Activity")
      expect(result.current.currentPlan?.saturday[0].startTime).toBe("09:00")
      expect(result.current.currentPlan?.saturday[0].endTime).toBe("11:00")
    })

    it("should remove activity from schedule", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      act(() => {
        result.current.addActivityToSchedule(mockActivity, "saturday", "09:00")
        result.current.removeActivityFromSchedule("test-activity", "saturday")
      })

      expect(result.current.currentPlan?.saturday).toHaveLength(0)
    })

    it("should update activity time", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      act(() => {
        result.current.addActivityToSchedule(mockActivity, "saturday", "09:00")
        result.current.updateActivityTime("test-activity", "saturday", "10:00")
      })

      expect(result.current.currentPlan?.saturday[0].startTime).toBe("10:00")
      expect(result.current.currentPlan?.saturday[0].endTime).toBe("12:00")
    })

    it("should move activity between days", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      act(() => {
        result.current.addActivityToSchedule(mockActivity, "saturday", "09:00")
        result.current.moveActivityBetweenDays("test-activity", "saturday", "sunday", "14:00")
      })

      expect(result.current.currentPlan?.saturday).toHaveLength(0)
      expect(result.current.currentPlan?.sunday).toHaveLength(1)
      expect(result.current.currentPlan?.sunday[0].startTime).toBe("14:00")
    })
  })

  describe("Mood Tracking", () => {
    it("should update plan mood", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      act(() => {
        result.current.createNewPlan("lazy")
      })

      const planId = result.current.currentPlan?.id!
      const moodEntry = {
        id: "mood-1",
        timestamp: new Date(),
        mood: "excited" as const,
        notes: "Feeling great about the weekend!",
      }

      act(() => {
        result.current.updatePlanMood(planId, "excited", moodEntry)
      })

      expect(result.current.currentPlan?.overallMood).toBe("excited")
      expect(result.current.currentPlan?.moodJournal).toHaveLength(1)
    })
  })

  describe("Theme Customization", () => {
    it("should update theme colors", () => {
      const { result } = renderHook(() => useWeekendPlannerStore())

      act(() => {
        result.current.createNewPlan("lazy")
      })

      const planId = result.current.currentPlan?.id!
      const customColors = {
        primary: "#ff0000",
        secondary: "#00ff00",
        accent: "#0000ff",
      }

      act(() => {
        result.current.updateThemeColors(planId, customColors)
      })

      expect(result.current.currentPlan?.customThemeColors).toEqual(customColors)
    })
  })
})

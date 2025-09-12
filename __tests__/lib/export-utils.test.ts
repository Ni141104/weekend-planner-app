import {
  exportPlanAsJSON,
  exportPlanAsCSV,
  generateShareableLink,
  parseSharedPlan,
  generatePlanSummary,
} from "@/lib/export-utils"
import type { WeekendPlan } from "@/lib/types"

const mockPlan: WeekendPlan = {
  id: "test-plan",
  name: "Test Weekend Plan",
  theme: "lazy",
  saturday: [
    {
      id: "activity-1",
      name: "Reading",
      category: "indoor",
      duration: 120,
      icon: "📚",
      description: "Read a good book",
      mood: "relaxed",
      day: "saturday",
      startTime: "09:00",
      endTime: "11:00",
    },
  ],
  sunday: [
    {
      id: "activity-2",
      name: "Hiking",
      category: "outdoor",
      duration: 180,
      icon: "🥾",
      description: "Nature walk",
      mood: "adventurous",
      day: "sunday",
      startTime: "10:00",
      endTime: "13:00",
    },
  ],
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
}

describe("Export Utils", () => {
  describe("exportPlanAsJSON", () => {
    it("should export plan as formatted JSON", () => {
      const result = exportPlanAsJSON(mockPlan)
      const parsed = JSON.parse(result)

      expect(parsed.id).toBe("test-plan")
      expect(parsed.name).toBe("Test Weekend Plan")
      expect(parsed.saturday).toHaveLength(1)
      expect(parsed.sunday).toHaveLength(1)
    })
  })

  describe("exportPlanAsCSV", () => {
    it("should export plan as CSV with correct headers", () => {
      const result = exportPlanAsCSV(mockPlan)
      const lines = result.split("\n")

      expect(lines[0]).toBe("Day,Activity,Start Time,End Time,Duration,Category,Mood,Notes")
      expect(lines[1]).toContain('Saturday,"Reading",09:00,11:00,120 minutes,indoor,relaxed')
      expect(lines[2]).toContain('Sunday,"Hiking",10:00,13:00,180 minutes,outdoor,adventurous')
    })
  })

  describe("generateShareableLink", () => {
    it("should generate a valid shareable link", () => {
      const result = generateShareableLink(mockPlan)

      expect(result).toContain("http://localhost:3000?shared=")
      expect(result.length).toBeGreaterThan(50) // Should contain encoded data
    })
  })

  describe("parseSharedPlan", () => {
    it("should parse shared plan data correctly", () => {
      const link = generateShareableLink(mockPlan)
      const sharedData = link.split("?shared=")[1]
      const result = parseSharedPlan(sharedData)

      expect(result).toBeTruthy()
      expect(result?.name).toBe("Test Weekend Plan")
      expect(result?.saturday).toHaveLength(1)
      expect(result?.sunday).toHaveLength(1)
    })

    it("should return null for invalid shared data", () => {
      const result = parseSharedPlan("invalid-data")
      expect(result).toBeNull()
    })
  })

  describe("generatePlanSummary", () => {
    it("should generate a readable plan summary", () => {
      const result = generatePlanSummary(mockPlan)

      expect(result).toContain("Weekend Plan: Test Weekend Plan")
      expect(result).toContain("Theme: Lazy Weekend")
      expect(result).toContain("Total Activities: 2")
      expect(result).toContain("Total Duration: 5h")
      expect(result).toContain("Saturday (1 activities):")
      expect(result).toContain("Sunday (1 activities):")
      expect(result).toContain("09:00 - Reading")
      expect(result).toContain("10:00 - Hiking")
    })
  })
})

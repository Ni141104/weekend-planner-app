import type { WeekendPlan } from "./types"
import { WEEKEND_THEMES } from "./activities-data"

export interface ExportOptions {
  format: "json" | "csv" | "pdf" | "image"
  includeNotes?: boolean
  includeMoodData?: boolean
  includeThemeInfo?: boolean
}

export const exportPlanAsJSON = (plan: WeekendPlan): string => {
  return JSON.stringify(plan, null, 2)
}

export const exportPlanAsCSV = (plan: WeekendPlan): string => {
  const headers = ["Day", "Activity", "Start Time", "End Time", "Duration", "Category", "Mood", "Notes"]
  const rows = [headers.join(",")]

  const allActivities = [
    ...plan.saturday.map((activity) => ({ ...activity, day: "Saturday" })),
    ...plan.sunday.map((activity) => ({ ...activity, day: "Sunday" })),
  ]

  allActivities.forEach((activity) => {
    const row = [
      activity.day,
      `"${activity.name}"`,
      activity.startTime,
      activity.endTime,
      `${activity.duration} minutes`,
      activity.category,
      activity.mood || "",
      `"${activity.notes || ""}"`,
    ]
    rows.push(row.join(","))
  })

  return rows.join("\n")
}

export const generateShareableLink = (plan: WeekendPlan): string => {
  const planData = {
    id: plan.id,
    name: plan.name,
    theme: plan.theme,
    saturday: plan.saturday,
    sunday: plan.sunday,
  }

  const encoded = btoa(JSON.stringify(planData))
  return `${window.location.origin}?shared=${encoded}`
}

export const parseSharedPlan = (sharedData: string): WeekendPlan | null => {
  try {
    const decoded = atob(sharedData)
    const planData = JSON.parse(decoded)

    return {
      ...planData,
      createdAt: new Date(),
      updatedAt: new Date(),
      moodJournal: [],
    }
  } catch (error) {
    console.error("Failed to parse shared plan:", error)
    return null
  }
}

export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const generatePlanSummary = (plan: WeekendPlan): string => {
  const theme = WEEKEND_THEMES.find((t) => t.id === plan.theme)
  const totalActivities = plan.saturday.length + plan.sunday.length
  const totalDuration = [...plan.saturday, ...plan.sunday].reduce((total, activity) => total + activity.duration, 0)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return `
Weekend Plan: ${plan.name}
Theme: ${theme?.name || plan.theme}
Total Activities: ${totalActivities}
Total Duration: ${formatDuration(totalDuration)}

Saturday (${plan.saturday.length} activities):
${plan.saturday
  .sort((a, b) => a.startTime.localeCompare(b.startTime))
  .map((activity) => `• ${activity.startTime} - ${activity.name} (${formatDuration(activity.duration)})`)
  .join("\n")}

Sunday (${plan.sunday.length} activities):
${plan.sunday
  .sort((a, b) => a.startTime.localeCompare(b.startTime))
  .map((activity) => `• ${activity.startTime} - ${activity.name} (${formatDuration(activity.duration)})`)
  .join("\n")}
  `.trim()
}

export const createPlanImage = async (plan: WeekendPlan): Promise<string> => {
  // Create a canvas element for generating the image
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  // Set canvas size
  canvas.width = 800
  canvas.height = 600

  // Background
  ctx.fillStyle = "#fefce8"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Title
  ctx.fillStyle = "#4b5563"
  ctx.font = "bold 32px Arial"
  ctx.textAlign = "center"
  ctx.fillText(plan.name, canvas.width / 2, 60)

  // Theme
  const theme = WEEKEND_THEMES.find((t) => t.id === plan.theme)
  if (theme) {
    ctx.font = "20px Arial"
    ctx.fillText(`${theme.icon} ${theme.name}`, canvas.width / 2, 100)
  }

  // Days
  const dayWidth = canvas.width / 2 - 40
  const dayHeight = 400
  const dayY = 140

  // Saturday
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(20, dayY, dayWidth, dayHeight)
  ctx.strokeStyle = "#e5e7eb"
  ctx.strokeRect(20, dayY, dayWidth, dayHeight)

  ctx.fillStyle = "#4b5563"
  ctx.font = "bold 24px Arial"
  ctx.textAlign = "left"
  ctx.fillText("Saturday", 40, dayY + 35)

  // Saturday activities
  ctx.font = "16px Arial"
  plan.saturday
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .forEach((activity, index) => {
      const y = dayY + 70 + index * 30
      if (y < dayY + dayHeight - 20) {
        ctx.fillText(`${activity.startTime} ${activity.name}`, 40, y)
      }
    })

  // Sunday
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(canvas.width / 2 + 20, dayY, dayWidth, dayHeight)
  ctx.strokeStyle = "#e5e7eb"
  ctx.strokeRect(canvas.width / 2 + 20, dayY, dayWidth, dayHeight)

  ctx.fillStyle = "#4b5563"
  ctx.font = "bold 24px Arial"
  ctx.fillText("Sunday", canvas.width / 2 + 40, dayY + 35)

  // Sunday activities
  ctx.font = "16px Arial"
  plan.sunday
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .forEach((activity, index) => {
      const y = dayY + 70 + index * 30
      if (y < dayY + dayHeight - 20) {
        ctx.fillText(`${activity.startTime} ${activity.name}`, canvas.width / 2 + 40, y)
      }
    })

  return canvas.toDataURL("image/png")
}

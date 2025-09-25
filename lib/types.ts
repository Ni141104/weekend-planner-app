export interface Activity {
  id: string
  name: string
  category: "outdoor" | "indoor" | "social" | "wellness" | "food" | "entertainment"
  duration: number // in minutes
  icon: string
  description?: string
  mood?: "energetic" | "relaxed" | "happy" | "adventurous"
  mapImage?: string // Optional map preview image URL
  isCustom?: boolean // Indicates if this is a user-created activity
}

export interface ScheduledActivity extends Activity {
  day: "saturday" | "sunday"
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  userMood?: "excited" | "neutral" | "stressed" | "tired" | "motivated"
  notes?: string
}

export interface WeekendPlan {
  id: string
  name: string
  theme: "lazy" | "adventurous" | "family" | "productive" | "social"
  saturday: ScheduledActivity[]
  sunday: ScheduledActivity[]
  createdAt: Date
  updatedAt: Date
  overallMood?: "excited" | "neutral" | "stressed" | "tired" | "motivated"
  customThemeColors?: {
    primary: string
    secondary: string
    accent: string
  }
  moodJournal?: MoodEntry[]
}

export interface WeekendTheme {
  id: string
  name: string
  description: string
  color: string
  suggestedActivities: string[]
  primaryColor: string
  secondaryColor: string
  accentColor: string
  icon?: string
  image?: string
  mood?: string
  vibe?: string
}

export interface MoodEntry {
  id: string
  timestamp: Date
  mood: "excited" | "neutral" | "stressed" | "tired" | "motivated"
  notes?: string
  activityId?: string
}

export interface MoodStats {
  averageMood: number
  moodDistribution: Record<string, number>
  moodTrends: Array<{
    date: string
    mood: number
  }>
}

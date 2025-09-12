import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { WeekendPlanner } from "@/components/weekend-planner"

// Mock the store with initial state
const mockStore = {
  currentPlan: null,
  selectedTheme: "lazy",
  createNewPlan: jest.fn(),
  setTheme: jest.fn(),
  savePlan: jest.fn(),
  addActivityToSchedule: jest.fn(),
  reorderActivities: jest.fn(),
  moveActivityBetweenDays: jest.fn(),
}

jest.mock("@/lib/store", () => ({
  useWeekendPlannerStore: () => mockStore,
}))

describe("WeekendPlanner", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows theme selector when no current plan", () => {
    render(<WeekendPlanner />)

    expect(screen.getByText("Weekendly")).toBeInTheDocument()
    expect(screen.getByText("Choose Your Weekend Vibe")).toBeInTheDocument()
    expect(screen.getByText("Lazy Weekend")).toBeInTheDocument()
  })

  it("calls createNewPlan when theme is selected", async () => {
    const user = userEvent.setup()
    render(<WeekendPlanner />)

    const lazyTheme = screen.getByText("Lazy Weekend")
    await user.click(lazyTheme)

    expect(mockStore.setTheme).toHaveBeenCalledWith("lazy")
    expect(mockStore.createNewPlan).toHaveBeenCalledWith("lazy")
  })

  it("shows main interface when current plan exists", () => {
    mockStore.currentPlan = {
      id: "test-plan",
      name: "Test Plan",
      theme: "lazy",
      saturday: [],
      sunday: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<WeekendPlanner />)

    expect(screen.getByText("Grid")).toBeInTheDocument()
    expect(screen.getByText("Overview")).toBeInTheDocument()
    expect(screen.getByText("Mood")).toBeInTheDocument()
    expect(screen.getByText("Saturday")).toBeInTheDocument()
    expect(screen.getByText("Sunday")).toBeInTheDocument()
  })

  it("switches between view modes", async () => {
    const user = userEvent.setup()
    mockStore.currentPlan = {
      id: "test-plan",
      name: "Test Plan",
      theme: "lazy",
      saturday: [],
      sunday: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    render(<WeekendPlanner />)

    // Switch to overview mode
    const overviewButton = screen.getByText("Overview")
    await user.click(overviewButton)

    expect(screen.getByText("Weekend Overview")).toBeInTheDocument()

    // Switch to mood mode
    const moodButton = screen.getByText("Mood")
    await user.click(moodButton)

    expect(screen.getByText("Mood Tracker")).toBeInTheDocument()
  })
})

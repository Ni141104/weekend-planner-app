import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ActivityBrowser } from "@/components/activity-browser"

// Mock the store
jest.mock("@/lib/store", () => ({
  useWeekendPlannerStore: () => ({
    addActivityToSchedule: jest.fn(),
  }),
}))

describe("ActivityBrowser", () => {
  it("renders activity browser with search and filters", () => {
    render(<ActivityBrowser />)

    expect(screen.getByPlaceholderText("Search activities...")).toBeInTheDocument()
    expect(screen.getByText("Activity Browser")).toBeInTheDocument()
    expect(screen.getByText("Click to add or drag to schedule")).toBeInTheDocument()
  })

  it("filters activities by search term", async () => {
    const user = userEvent.setup()
    render(<ActivityBrowser />)

    const searchInput = screen.getByPlaceholderText("Search activities...")
    await user.type(searchInput, "hiking")

    await waitFor(() => {
      expect(screen.getByText("Hiking")).toBeInTheDocument()
      expect(screen.queryByText("Cooking")).not.toBeInTheDocument()
    })
  })

  it("filters activities by category", async () => {
    const user = userEvent.setup()
    render(<ActivityBrowser />)

    // Open category filter
    const categoryFilter = screen.getByRole("combobox")
    await user.click(categoryFilter)

    // Select outdoor category
    await user.click(screen.getByText("Outdoor"))

    await waitFor(() => {
      expect(screen.getByText("Hiking")).toBeInTheDocument()
      expect(screen.queryByText("Reading")).not.toBeInTheDocument()
    })
  })

  it("opens add dialog when activity is clicked", async () => {
    const user = userEvent.setup()
    render(<ActivityBrowser />)

    const hikingActivity = screen.getByText("Hiking")
    await user.click(hikingActivity)

    await waitFor(() => {
      expect(screen.getByText("Add Activity to Schedule")).toBeInTheDocument()
    })
  })

  it("shows no results message when no activities match filters", async () => {
    const user = userEvent.setup()
    render(<ActivityBrowser />)

    const searchInput = screen.getByPlaceholderText("Search activities...")
    await user.type(searchInput, "nonexistent activity")

    await waitFor(() => {
      expect(screen.getByText("No activities found matching your criteria")).toBeInTheDocument()
    })
  })
})

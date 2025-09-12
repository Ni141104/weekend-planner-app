"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useWeekendPlannerStore } from "@/lib/store"
import { ExportDialog } from "./export-dialog"
import type { WeekendPlan } from "@/lib/types"
import { WEEKEND_THEMES } from "@/lib/activities-data"
import { FolderOpen, Trash2, Edit, Calendar, Clock, Share2 } from "lucide-react"

export function PlanManager() {
  const { savedPlans, loadPlan, deletePlan, currentPlan } = useWeekendPlannerStore()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPlan, setEditingPlan] = useState<WeekendPlan | null>(null)
  const [newPlanName, setNewPlanName] = useState("")

  const filteredPlans = savedPlans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.theme.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleLoadPlan = (planId: string) => {
    loadPlan(planId)
    setIsOpen(false)
  }

  const handleDeletePlan = (planId: string) => {
    if (confirm("Are you sure you want to delete this plan?")) {
      deletePlan(planId)
    }
  }

  const handleEditPlan = (plan: WeekendPlan) => {
    setEditingPlan(plan)
    setNewPlanName(plan.name)
  }

  const handleSaveEdit = () => {
    if (editingPlan && newPlanName.trim()) {
      // Update plan name logic would go here
      setEditingPlan(null)
      setNewPlanName("")
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  const getTotalActivities = (plan: WeekendPlan) => {
    return plan.saturday.length + plan.sunday.length
  }

  const getTotalDuration = (plan: WeekendPlan) => {
    const total = [...plan.saturday, ...plan.sunday].reduce((sum, activity) => sum + activity.duration, 0)
    const hours = Math.floor(total / 60)
    const minutes = total % 60
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderOpen className="h-4 w-4 mr-2" />
          Manage Plans
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Saved Weekend Plans
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="mb-4">
            <Input
              placeholder="Search plans by name or theme..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Plans List */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No saved plans found</p>
                <p className="text-sm">Create and save your first weekend plan!</p>
              </div>
            ) : (
              filteredPlans.map((plan) => {
                const theme = WEEKEND_THEMES.find((t) => t.id === plan.theme)
                const isCurrentPlan = currentPlan?.id === plan.id

                return (
                  <Card key={plan.id} className={`${isCurrentPlan ? "ring-2 ring-primary" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{plan.name}</h3>
                            {isCurrentPlan && <Badge variant="default">Current</Badge>}
                            {theme && <Badge className={theme.color}>{theme.name}</Badge>}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(plan.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTotalDuration(plan)}
                            </div>
                            <div>{getTotalActivities(plan)} activities</div>
                            <div>
                              {plan.saturday.length} Sat, {plan.sunday.length} Sun
                            </div>
                          </div>

                          {/* Activity Preview */}
                          <div className="flex flex-wrap gap-1">
                            {[...plan.saturday, ...plan.sunday].slice(0, 6).map((activity, index) => (
                              <span key={index} className="text-lg" title={activity.name}>
                                {activity.icon}
                              </span>
                            ))}
                            {getTotalActivities(plan) > 6 && (
                              <span className="text-xs text-muted-foreground">
                                +{getTotalActivities(plan) - 6} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleLoadPlan(plan.id)}>
                            Load
                          </Button>
                          <ExportDialog
                            plan={plan}
                            trigger={
                              <Button size="sm" variant="outline">
                                <Share2 className="h-3 w-3" />
                              </Button>
                            }
                          />
                          <Button size="sm" variant="outline" onClick={() => handleEditPlan(plan)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* Edit Plan Dialog */}
        <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="Enter plan name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingPlan(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

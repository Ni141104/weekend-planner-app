"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Sparkles } from "lucide-react"
import type { Activity } from "@/lib/types"

interface CustomActivityCreatorProps {
  onActivityCreated: (activity: Activity) => void
}

const ACTIVITY_ICONS = [
  "🎯", "🎨", "🎵", "🎭", "🎪", "🎲", "🎸", "🎹", "🎤", "🎧",
  "📚", "📝", "📷", "📺", "🎬", "🎮", "🕹️", "🎳", "⚽", "🏀",
  "🏈", "⚾", "🎾", "🏐", "🏓", "🏸", "🥊", "🏊", "🚴", "🏃",
  "🧘", "🧗", "🛶", "🏄", "🎿", "🏂", "🤿", "🏇", "🎯", "🎪",
  "🍽️", "🍕", "🍔", "🍜", "🍣", "🍰", "☕", "🍷", "🍸", "🥂",
  "🌳", "🌸", "🌺", "🏔️", "🏖️", "🏞️", "🌊", "🔥", "⭐", "🌙"
]

const ACTIVITY_CATEGORIES = [
  { id: "outdoor", label: "Outdoor" },
  { id: "indoor", label: "Indoor" },
  { id: "social", label: "Social" },
  { id: "wellness", label: "Wellness" },
  { id: "food", label: "Food & Drink" },
  { id: "entertainment", label: "Entertainment" },
  { id: "creative", label: "Creative" },
  { id: "fitness", label: "Fitness" },
]

const ACTIVITY_MOODS = [
  { id: "relaxed", label: "Relaxed" },
  { id: "energetic", label: "Energetic" },
  { id: "adventurous", label: "Adventurous" },
  { id: "happy", label: "Happy" },
  { id: "peaceful", label: "Peaceful" },
  { id: "exciting", label: "Exciting" },
]

export function CustomActivityCreator({ onActivityCreated }: CustomActivityCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    duration: "",
    icon: "🎯",
    mood: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.category || !formData.duration || !formData.mood) {
      return
    }

    const newActivity: Activity = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description || `Custom ${formData.category} activity`,
      category: formData.category as Activity["category"],
      duration: parseInt(formData.duration),
      icon: formData.icon,
      mood: formData.mood as Activity["mood"],
      isCustom: true,
    }

    onActivityCreated(newActivity)
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      category: "",
      duration: "",
      icon: "🎯",
      mood: "",
    })
    
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl hover:scale-105 h-full">
          <CardContent className="p-3 relative">
            <div className="text-center">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">➕</div>
              <h3 className="font-medium text-xs mb-3 line-clamp-2 leading-tight text-foreground">Create Custom</h3>
              <div className="flex flex-col gap-1.5 mb-3">
                <div className="bg-purple-100 text-purple-800 text-xs py-0.5 px-2 rounded-full border-0 self-center">
                  custom
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Plus className="h-3 w-3" />
                Add Activity
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Create Your Custom Activity
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Activity Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Board Game Night"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="720"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="60"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what makes this activity special..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mood *</Label>
              <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a mood" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_MOODS.map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="grid grid-cols-10 gap-2 p-4 border rounded-lg max-h-32 overflow-y-auto">
              {ACTIVITY_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`p-2 text-xl rounded hover:bg-muted transition-colors ${
                    formData.icon === icon ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Activity
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { WEEKEND_THEMES } from "@/lib/activities-data"
import { useWeekendPlannerStore } from "@/lib/store"
import type { WeekendPlan } from "@/lib/types"
import { Palette, Sparkles, RotateCcw } from "lucide-react"

interface ThemeCustomizerProps {
  plan: WeekendPlan
}

export function ThemeCustomizer({ plan }: ThemeCustomizerProps) {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [customColors, setCustomColors] = useState({
    primary: plan.customThemeColors?.primary || "#a16207",
    secondary: plan.customThemeColors?.secondary || "#6366f1",
    accent: plan.customThemeColors?.accent || "#22c55e",
  })

  const { updateThemeColors, setTheme } = useWeekendPlannerStore()

  const currentTheme = WEEKEND_THEMES.find((theme) => theme.id === plan.theme)

  const handleSaveColors = () => {
    updateThemeColors(plan.id, customColors)
    setIsCustomizeOpen(false)
  }

  const handleResetColors = () => {
    if (currentTheme) {
      const defaultColors = {
        primary: currentTheme.primaryColor,
        secondary: currentTheme.secondaryColor,
        accent: currentTheme.accentColor,
      }
      setCustomColors(defaultColors)
      updateThemeColors(plan.id, defaultColors)
    }
  }

  const previewStyle = {
    "--preview-primary": customColors.primary,
    "--preview-secondary": customColors.secondary,
    "--preview-accent": customColors.accent,
  } as React.CSSProperties

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme & Style
          </CardTitle>
          <Dialog open={isCustomizeOpen} onOpenChange={setIsCustomizeOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Sparkles className="h-4 w-4 mr-1" />
                Customize
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Your Theme</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Color Customization */}
                <div className="space-y-4">
                  <h4 className="font-medium">Colors</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="primary-color"
                          type="color"
                          value={customColors.primary}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customColors.primary}
                          onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                          placeholder="#a16207"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors({ ...customColors, secondary: e.target.value })}
                          placeholder="#6366f1"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="accent-color"
                          type="color"
                          value={customColors.accent}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={customColors.accent}
                          onChange={(e) => setCustomColors({ ...customColors, accent: e.target.value })}
                          placeholder="#22c55e"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium">Preview</h4>
                  <div className="p-4 border rounded-lg" style={previewStyle}>
                    <div className="space-y-2">
                      <div
                        className="h-8 rounded flex items-center px-3 text-white text-sm font-medium"
                        style={{ backgroundColor: "var(--preview-primary)" }}
                      >
                        Primary Button
                      </div>
                      <div
                        className="h-8 rounded flex items-center px-3 text-white text-sm font-medium"
                        style={{ backgroundColor: "var(--preview-secondary)" }}
                      >
                        Secondary Button
                      </div>
                      <div
                        className="h-6 rounded flex items-center px-2 text-white text-xs"
                        style={{ backgroundColor: "var(--preview-accent)" }}
                      >
                        Accent Badge
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={handleResetColors} className="flex-1 bg-transparent">
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button onClick={handleSaveColors} className="flex-1">
                    Save Changes
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Theme */}
        <div>
          <h4 className="font-medium mb-2">Current Theme</h4>
          {currentTheme && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-2xl">{currentTheme.icon}</span>
              <div className="flex-1">
                <h5 className="font-medium">{currentTheme.name}</h5>
                <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
              </div>
              <Badge className={currentTheme.color}>{currentTheme.name}</Badge>
            </div>
          )}
        </div>

        {/* Quick Theme Switch */}
        <div>
          <h4 className="font-medium mb-2">Quick Switch</h4>
          <div className="grid grid-cols-2 gap-2">
            {WEEKEND_THEMES.filter((theme) => theme.id !== plan.theme)
              .slice(0, 4)
              .map((theme) => (
                <Button
                  key={theme.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme.id)}
                  className="h-auto p-2 flex flex-col gap-1"
                >
                  <span className="text-lg">{theme.icon}</span>
                  <span className="text-xs">{theme.name}</span>
                </Button>
              ))}
          </div>
        </div>

        {/* Custom Colors Preview */}
        {plan.customThemeColors && (
          <div>
            <h4 className="font-medium mb-2">Custom Colors</h4>
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: plan.customThemeColors.primary }}
                title="Primary"
              />
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: plan.customThemeColors.secondary }}
                title="Secondary"
              />
              <div
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: plan.customThemeColors.accent }}
                title="Accent"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

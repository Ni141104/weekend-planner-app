"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import type { WeekendPlan } from "@/lib/types"
import {
  exportPlanAsJSON,
  exportPlanAsCSV,
  generateShareableLink,
  downloadFile,
  generatePlanSummary,
  createPlanImage,
} from "@/lib/export-utils"
import { Share2, Copy, ImageIcon, FileText, Database, Link } from "lucide-react"

interface ExportDialogProps {
  plan: WeekendPlan
  trigger?: React.ReactNode
}

export function ExportDialog({ plan, trigger }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [includeNotes, setIncludeNotes] = useState(true)
  const [includeMoodData, setIncludeMoodData] = useState(true)
  const [includeThemeInfo, setIncludeThemeInfo] = useState(true)
  const [shareableLink, setShareableLink] = useState("")
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const { toast } = useToast()

  const handleExportJSON = () => {
    const jsonData = exportPlanAsJSON(plan)
    downloadFile(jsonData, `${plan.name.replace(/\s+/g, "_")}.json`, "application/json")
    toast({
      title: "Export Complete",
      description: "Your weekend plan has been exported as JSON.",
    })
  }

  const handleExportCSV = () => {
    const csvData = exportPlanAsCSV(plan)
    downloadFile(csvData, `${plan.name.replace(/\s+/g, "_")}.csv`, "text/csv")
    toast({
      title: "Export Complete",
      description: "Your weekend plan has been exported as CSV.",
    })
  }

  const handleExportText = () => {
    const textData = generatePlanSummary(plan)
    downloadFile(textData, `${plan.name.replace(/\s+/g, "_")}.txt`, "text/plain")
    toast({
      title: "Export Complete",
      description: "Your weekend plan has been exported as text.",
    })
  }

  const handleGenerateShareLink = () => {
    const link = generateShareableLink(plan)
    setShareableLink(link)
    navigator.clipboard.writeText(link)
    toast({
      title: "Link Copied",
      description: "Shareable link has been copied to your clipboard.",
    })
  }

  const handleExportImage = async () => {
    setIsGeneratingImage(true)
    try {
      const imageData = await createPlanImage(plan)
      const link = document.createElement("a")
      link.href = imageData
      link.download = `${plan.name.replace(/\s+/g, "_")}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Export Complete",
        description: "Your weekend plan has been exported as an image.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: `${label} copied to clipboard.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Export & Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Export & Share Weekend Plan
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share">Share</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Share Your Plan</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a shareable link that others can use to view your weekend plan.
              </p>

              <div className="space-y-3">
                <Button onClick={handleGenerateShareLink} className="w-full">
                  <Link className="h-4 w-4 mr-2" />
                  Generate Shareable Link
                </Button>

                {shareableLink && (
                  <div className="p-3 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">Shareable Link</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={shareableLink} readOnly className="flex-1" />
                      <Button size="sm" variant="outline" onClick={() => copyToClipboard(shareableLink, "Link")}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Export Options</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="notes" checked={includeNotes} onCheckedChange={setIncludeNotes} />
                  <Label htmlFor="notes">Include activity notes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mood" checked={includeMoodData} onCheckedChange={setIncludeMoodData} />
                  <Label htmlFor="mood">Include mood tracking data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="theme" checked={includeThemeInfo} onCheckedChange={setIncludeThemeInfo} />
                  <Label htmlFor="theme">Include theme information</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleExportJSON}
                className="h-auto p-4 flex flex-col gap-2 bg-transparent"
              >
                <Database className="h-6 w-6" />
                <span className="font-medium">JSON</span>
                <span className="text-xs text-muted-foreground">Structured data</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleExportCSV}
                className="h-auto p-4 flex flex-col gap-2 bg-transparent"
              >
                <FileText className="h-6 w-6" />
                <span className="font-medium">CSV</span>
                <span className="text-xs text-muted-foreground">Spreadsheet format</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleExportText}
                className="h-auto p-4 flex flex-col gap-2 bg-transparent"
              >
                <FileText className="h-6 w-6" />
                <span className="font-medium">Text</span>
                <span className="text-xs text-muted-foreground">Plain text summary</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleExportImage}
                disabled={isGeneratingImage}
                className="h-auto p-4 flex flex-col gap-2 bg-transparent"
              >
                <ImageIcon className="h-6 w-6" />
                <span className="font-medium">Image</span>
                <span className="text-xs text-muted-foreground">
                  {isGeneratingImage ? "Generating..." : "Visual poster"}
                </span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Plan Summary</h4>
              <div className="p-4 bg-muted rounded-lg">
                <Textarea
                  value={generatePlanSummary(plan)}
                  readOnly
                  className="min-h-[200px] resize-none"
                  placeholder="Plan summary will appear here..."
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(generatePlanSummary(plan), "Summary")}
                className="mt-2"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Summary
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Plan Statistics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{plan.saturday.length + plan.sunday.length}</div>
                  <div className="text-sm text-muted-foreground">Total Activities</div>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.floor(
                      [...plan.saturday, ...plan.sunday].reduce((total, activity) => total + activity.duration, 0) / 60,
                    )}
                    h
                  </div>
                  <div className="text-sm text-muted-foreground">Total Duration</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

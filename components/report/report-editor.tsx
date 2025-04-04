"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"

interface ReportEditorProps {
  initialContent: string
  onSubmit: (content: string) => void
  onBack: () => void
}

export function ReportEditor({ initialContent, onSubmit, onBack }: ReportEditorProps) {
  const [content, setContent] = useState(initialContent || getReportTemplate())
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length
    setWordCount(words)
  }, [content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(content)
  }

  function getReportTemplate() {
    return `# Incident Narrative

On ${new Date().toLocaleDateString()} at approximately ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}, I was dispatched to the location regarding a reported incident.

## Initial Observations

Upon arrival, I observed the scene and noted the following details.

## Actions Taken

I took the following actions in response to the situation.

## Statements

Relevant statements from involved parties.

## Evidence

Evidence collected and how it was processed.

## Conclusion

Based on my investigation, I have determined the following.`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">Report Narrative</h3>
          <span className="text-sm text-gray-500">{wordCount} words</span>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
          <p>
            <strong>Writing Tips:</strong> Be clear, concise, and factual. Avoid police jargon when possible. Include
            only what you personally observed or what was directly reported to you. Use specific details and
            chronological order.
          </p>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[400px] font-mono text-sm"
          placeholder="Enter your report narrative here..."
          required
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit">Continue to Review</Button>
      </div>
    </form>
  )
}


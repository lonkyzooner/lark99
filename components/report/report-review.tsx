"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertCircle, CheckCircle, Edit } from "lucide-react"
import type { ReportData } from "./report-writing"
import { APIService } from "@/lib/api-service"

interface ReportReviewProps {
  reportData: ReportData
  onComplete: (finalContent: string) => void
  onBack: () => void
}

interface FeedbackItem {
  type: "clarity" | "jargon" | "grammar" | "expansion" | "positive" | "procedural" | "objectivity" | "timeline" | "evidence"
  text: string
  suggestion?: string
  lineNumber?: number
  severity?: "high" | "medium" | "low"
}

export function ReportReview({ reportData, onComplete, onBack }: ReportReviewProps) {
  const [content, setContent] = useState(reportData.content)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [isReviewing, setIsReviewing] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const apiServiceRef = useRef<APIService>(APIService.getInstance())

  useEffect(() => {
    // Use LARK's API to analyze the report
    if (isReviewing) {
      const analyzeReport = async () => {
        try {
          const result = await apiServiceRef.current.analyzeReport(content, reportData)
          if (result && Array.isArray(result.feedback)) {
            setFeedback(result.feedback)
          } else {
            // Fallback in case the API doesn't return the expected format
            setFeedback([{
              type: "clarity",
              text: "Unable to analyze report. Please try again.",
              suggestion: "Check your internet connection and try again."
            }])
          }
        } catch (error) {
          console.error('Error analyzing report:', error)
          setFeedback([{
            type: "clarity",
            text: "An error occurred during report analysis.",
            suggestion: "Please try again later."
          }])
        } finally {
          setIsReviewing(false)
        }
      }

      analyzeReport()
    }
  }, [content, isReviewing, reportData])

  const handleSubmit = () => {
    onComplete(content)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
    setIsReviewing(true)
  }

  // Report analysis is now handled by the API service

  return (
    <div className="space-y-6">
      {isReviewing ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">LARK is analyzing your report for legal defensibility and clarity...</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium mb-2">Report Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Incident Type:</span>
                  <span className="ml-2">{reportData.incidentType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Date/Time:</span>
                  <span className="ml-2">
                    {reportData.date.toLocaleDateString()} {reportData.time}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Location:</span>
                  <span className="ml-2">{reportData.location}</span>
                </div>
                <div>
                  <span className="text-gray-500">Officer:</span>
                  <span className="ml-2">
                    {reportData.officerName} #{reportData.badgeNumber}
                  </span>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Report Content</h3>
                  <Button variant="outline" size="sm" onClick={handleEdit} className="gap-1">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                </div>
                <div className="p-4 bg-white rounded-lg border border-gray-200 whitespace-pre-line">{content}</div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Edit Report</h3>
                  <Button size="sm" onClick={handleSaveEdit} className="gap-1">
                    Save Changes
                  </Button>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-medium">LARK's Review Feedback</h3>

              {feedback.length === 0 ? (
                <p className="text-gray-500 italic">No feedback available yet.</p>
              ) : (
                <div className="space-y-3">
                  {feedback.map((item, index) => (
                    <Card
                      key={index}
                      className={`
                      ${item.type === "clarity" ? "border-yellow-300 bg-yellow-50" : ""}
                      ${item.type === "jargon" ? "border-blue-300 bg-blue-50" : ""}
                      ${item.type === "grammar" ? "border-red-300 bg-red-50" : ""}
                      ${item.type === "expansion" ? "border-purple-300 bg-purple-50" : ""}
                      ${item.type === "positive" ? "border-green-300 bg-green-50" : ""}
                      ${item.type === "procedural" ? "border-orange-300 bg-orange-50" : ""}
                      ${item.type === "objectivity" ? "border-indigo-300 bg-indigo-50" : ""}
                      ${item.type === "timeline" ? "border-cyan-300 bg-cyan-50" : ""}
                      ${item.type === "evidence" ? "border-emerald-300 bg-emerald-50" : ""}
                      ${item.severity === "high" ? "ring-2 ring-red-300" : ""}
                    `}
                    >
                      <CardContent className="p-3 text-sm">
                        <div className="flex gap-2">
                          {item.type === "positive" ? (
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className={`h-5 w-5 flex-shrink-0 ${item.severity === "high" ? "text-red-500" : item.severity === "medium" ? "text-amber-500" : "text-blue-500"}`} />
                          )}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium">{item.text}</p>
                              {item.severity && item.severity !== "low" && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${item.severity === "high" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                                  {item.severity === "high" ? "Critical" : "Important"}
                                </span>
                              )}
                            </div>
                            {item.suggestion && <p className="text-gray-600 mt-1">{item.suggestion}</p>}
                            {item.lineNumber && <p className="text-gray-500 text-xs mt-1">Line {item.lineNumber}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
                <p className="text-sm">
                  <strong>Report Analysis:</strong> LARK reviews your report for clarity, completeness, and legal defensibility.
                  The feedback highlights areas where more precision or detail would strengthen your documentation,
                  focusing on elements that could be challenged in court proceedings.
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                    <span>Clarity Issues</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                    <span>Jargon/Terminology</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-300"></div>
                    <span>Grammar/Spelling</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-300"></div>
                    <span>Needs Expansion</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-300"></div>
                    <span>Procedural Concerns</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-300"></div>
                    <span>Positive Elements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Editor
            </Button>
            <Button onClick={handleSubmit}>Complete Report</Button>
          </div>
        </>
      )}
    </div>
  )
}


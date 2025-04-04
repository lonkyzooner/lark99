"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, FileCheck } from "lucide-react"
import { ReportForm } from "./report-form"
import { ReportEditor } from "./report-editor"
import { ReportReview } from "./report-review"

type ReportStep = "form" | "editor" | "review" | "complete"

interface ReportWritingProps {
  onBack: () => void
}

export interface ReportData {
  id: string
  incidentType: string
  date: Date
  time: string
  location: string
  involvedParties: string
  content: string
  caseNumber: string
  officerName: string
  badgeNumber: string
}

export function ReportWriting({ onBack }: ReportWritingProps) {
  const [step, setStep] = useState<ReportStep>("form")
  const [reportData, setReportData] = useState<ReportData>({
    id: `IR-${Date.now().toString().slice(-6)}`,
    incidentType: "",
    date: new Date(),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: "",
    involvedParties: "",
    content: "",
    caseNumber: `CN-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    officerName: "Officer Name",
    badgeNumber: "12345",
  })

  const handleFormSubmit = (formData: Partial<ReportData>) => {
    setReportData({ ...reportData, ...formData })
    setStep("editor")
  }

  const handleEditorSubmit = (content: string) => {
    setReportData({ ...reportData, content })
    setStep("review")
  }

  const handleReviewComplete = (finalContent: string) => {
    setReportData({ ...reportData, content: finalContent })
    setStep("complete")
    // In a real implementation, this would save the report to a database
    console.log("Report saved:", reportData)
  }

  const handleSaveDraft = () => {
    // In a real implementation, this would save the report as a draft
    console.log("Draft saved:", reportData)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Tools
        </Button>

        {step !== "complete" && (
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Incident Report {reportData.id}</span>
            <div className="flex items-center space-x-1 text-sm font-normal">
              <div className={`h-2 w-2 rounded-full ${step === "form" ? "bg-blue-500" : "bg-blue-200"}`}></div>
              <div className={`h-2 w-2 rounded-full ${step === "editor" ? "bg-blue-500" : "bg-blue-200"}`}></div>
              <div className={`h-2 w-2 rounded-full ${step === "review" ? "bg-blue-500" : "bg-blue-200"}`}></div>
              <div className={`h-2 w-2 rounded-full ${step === "complete" ? "bg-blue-500" : "bg-blue-200"}`}></div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "form" && <ReportForm initialData={reportData} onSubmit={handleFormSubmit} />}

          {step === "editor" && (
            <ReportEditor
              initialContent={reportData.content}
              onSubmit={handleEditorSubmit}
              onBack={() => setStep("form")}
            />
          )}

          {step === "review" && (
            <ReportReview reportData={reportData} onComplete={handleReviewComplete} onBack={() => setStep("editor")} />
          )}

          {step === "complete" && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FileCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Report Completed</h3>
                <p className="text-gray-500 text-center mt-2">
                  Your incident report has been saved and is ready for submission.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2">Report Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Report ID:</span>
                    <span className="ml-2 font-medium">{reportData.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Case Number:</span>
                    <span className="ml-2 font-medium">{reportData.caseNumber}</span>
                  </div>
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
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={onBack} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Return to Tools
                </Button>
                <Button variant="outline">View All Reports</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


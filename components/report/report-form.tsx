"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReportData } from "./report-writing"

interface ReportFormProps {
  initialData: ReportData
  onSubmit: (data: Partial<ReportData>) => void
}

export function ReportForm({ initialData, onSubmit }: ReportFormProps) {
  const [formData, setFormData] = useState<Partial<ReportData>>({
    incidentType: initialData.incidentType || "",
    date: initialData.date || new Date(),
    time: initialData.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: initialData.location || "",
    involvedParties: initialData.involvedParties || "",
    officerName: initialData.officerName || "",
    badgeNumber: initialData.badgeNumber || "",
  })

  const [timeOpen, setTimeOpen] = useState(false)

  const handleChange = (field: keyof ReportData, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const incidentTypes = [
    "Traffic Stop",
    "Domestic Disturbance",
    "Theft",
    "Assault",
    "Burglary",
    "Suspicious Activity",
    "Welfare Check",
    "Noise Complaint",
    "Vandalism",
    "Other",
  ]

  const timeOptions = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const formattedHour = hour.toString().padStart(2, "0")
      const formattedMinute = minute.toString().padStart(2, "0")
      timeOptions.push(`${formattedHour}:${formattedMinute}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="incident-type">Incident Type</Label>
          <Select value={formData.incidentType} onValueChange={(value) => handleChange("incidentType", value)} required>
            <SelectTrigger id="incident-type">
              <SelectValue placeholder="Select incident type" />
            </SelectTrigger>
            <SelectContent>
              {incidentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !formData.date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => handleChange("date", date || new Date())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Time</Label>
          <Popover open={timeOpen} onOpenChange={setTimeOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Clock className="mr-2 h-4 w-4" />
                {formData.time || "Select time"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-0">
              <div className="h-60 overflow-y-auto p-1">
                {timeOptions.map((time) => (
                  <Button
                    key={time}
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleChange("time", time)
                      setTimeOpen(false)
                    }}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Enter incident location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="involved-parties">Involved Parties</Label>
          <Input
            id="involved-parties"
            placeholder="Names and details of individuals involved"
            value={formData.involvedParties}
            onChange={(e) => handleChange("involvedParties", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="officer-name">Officer Name</Label>
          <Input
            id="officer-name"
            placeholder="Your full name"
            value={formData.officerName}
            onChange={(e) => handleChange("officerName", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="badge-number">Badge Number</Label>
          <Input
            id="badge-number"
            placeholder="Your badge number"
            value={formData.badgeNumber}
            onChange={(e) => handleChange("badgeNumber", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full">
          Continue to Report Details
        </Button>
      </div>
    </form>
  )
}


"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, FileText, Camera, Flashlight } from "lucide-react"
import { useState } from "react"
import { ReportWriting } from "@/components/report/report-writing"

export function ToolsView() {
  const [activeTab, setActiveTab] = useState<"tools" | "report">("tools")

  const handleEmergencyCall = () => {
    // In a real implementation, this would initiate an emergency call
    console.log("Emergency call initiated")
  }

  const handleLocationShare = () => {
    // In a real implementation, this would share the officer's location
    console.log("Location shared with dispatch")
  }

  const handleIncidentReport = () => {
    // Switch to the report writing tab
    setActiveTab("report")
  }

  const handleCamera = () => {
    // In a real implementation, this would activate the device camera
    console.log("Camera activated")
  }

  const handleFlashlight = () => {
    // In a real implementation, this would toggle the device flashlight
    console.log("Flashlight toggled")
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === "tools" ? (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="destructive" className="w-full justify-start gap-2" onClick={handleEmergencyCall}>
                <Phone className="h-5 w-5" />
                Emergency Call
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-yellow-500 text-yellow-700"
                onClick={handleLocationShare}
              >
                <MapPin className="h-5 w-5" />
                Share Location with Dispatch
              </Button>

              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleIncidentReport}>
                <FileText className="h-5 w-5" />
                Incident Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCamera}>
                <Camera className="h-5 w-5" />
                Camera
              </Button>

              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleFlashlight}>
                <Flashlight className="h-5 w-5" />
                Flashlight
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1">
                  <span className="font-medium">Traffic Stop Procedure</span>
                  <span className="text-xs text-gray-500 text-left">Standard protocol for vehicle stops</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1">
                  <span className="font-medium">Arrest Procedure</span>
                  <span className="text-xs text-gray-500 text-left">Legal requirements for arrests</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1">
                  <span className="font-medium">Evidence Collection</span>
                  <span className="text-xs text-gray-500 text-left">Guidelines for preserving evidence</span>
                </Button>

                <Button variant="outline" className="h-auto py-4 flex flex-col items-start gap-1">
                  <span className="font-medium">Use of Force Policy</span>
                  <span className="text-xs text-gray-500 text-left">Department guidelines on force</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ReportWriting onBack={() => setActiveTab("tools")} />
      )}
    </div>
  )
}


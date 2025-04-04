"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Volume2, VolumeX, Shield } from "lucide-react"
import type { UserProfile } from "@/components/views/settings-view"
import { LarkAIService } from "@/lib/lark-ai-service"
import { motion, AnimatePresence } from "framer-motion"

interface ThreatsViewProps {
  userProfile: UserProfile
}

export function ThreatsView({ userProfile }: ThreatsViewProps) {
  const [threatMonitoring, setThreatMonitoring] = useState(true)
  const [detectedThreats, setDetectedThreats] = useState<
    Array<{
      id: string
      type: string
      timestamp: Date
      severity: "low" | "medium" | "high"
    }>
  >([])
  const [larkService] = useState(() => LarkAIService.getInstance())

  // In a real implementation, this would connect to actual audio processing
  // and add real detected threats to the list

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "low":
        return "bg-yellow-500 text-yellow-50"
      case "medium":
        return "bg-orange-500 text-orange-50"
      case "high":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="premium-card overflow-visible">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Threat Detection</span>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="threat-monitoring"
                  checked={threatMonitoring}
                  onCheckedChange={setThreatMonitoring}
                  className="data-[state=checked]:bg-primary"
                />
                <Label htmlFor="threat-monitoring" className="text-sm font-normal">
                  {threatMonitoring ? "Monitoring Active" : "Monitoring Paused"}
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-8 mt-4">
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full bg-secondary">
                {threatMonitoring ? (
                  <>
                    <Volume2 className="h-12 w-12 text-primary animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring opacity-30"></div>
                  </>
                ) : (
                  <VolumeX className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Recent Detections
              </h3>

              <AnimatePresence>
                {detectedThreats.length === 0 ? (
                  <motion.p
                    className="text-center text-muted-foreground py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    No threats detected
                  </motion.p>
                ) : (
                  <motion.ul className="space-y-3">
                    {detectedThreats.map((threat, index) => (
                      <motion.li
                        key={threat.id}
                        className="p-3 bg-secondary/50 rounded-xl border border-border/50 shadow-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{threat.type}</span>
                            <p className="text-sm text-muted-foreground">{threat.timestamp.toLocaleTimeString()}</p>
                          </div>
                          <Badge className={getSeverityColor(threat.severity)}>{threat.severity.toUpperCase()}</Badge>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="premium-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Audio Analysis Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="gunshot-detection" className="font-medium">
                    Gunshot Detection
                  </Label>
                  <p className="text-sm text-muted-foreground">Detect potential gunshots in audio</p>
                </div>
                <Switch id="gunshot-detection" defaultChecked className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-analysis" className="font-medium">
                    Voice Analysis
                  </Label>
                  <p className="text-sm text-muted-foreground">Detect raised voices and aggressive tones</p>
                </div>
                <Switch id="voice-analysis" defaultChecked className="data-[state=checked]:bg-primary" />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="glass-breaking" className="font-medium">
                    Glass Breaking
                  </Label>
                  <p className="text-sm text-muted-foreground">Detect sounds of breaking glass</p>
                </div>
                <Switch id="glass-breaking" defaultChecked className="data-[state=checked]:bg-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


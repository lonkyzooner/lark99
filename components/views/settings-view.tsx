"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Save, RefreshCw, User, Volume2, SettingsIcon, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

export interface UserProfile {
  rank: string
  firstName: string
  lastName: string
  codename: string
  badgeNumber: string
  department: string
}

interface SettingsViewProps {
  userProfile: UserProfile
  onUpdateProfile: (profile: UserProfile) => void
}

export function SettingsView({ userProfile, onUpdateProfile }: SettingsViewProps) {
  const [voiceVolume, setVoiceVolume] = useState(80)
  const [voiceSpeed, setVoiceSpeed] = useState(1)
  const [voiceType, setVoiceType] = useState("ash")
  const [offlineMode, setOfflineMode] = useState(false)
  const [profile, setProfile] = useState<UserProfile>(userProfile)
  const { toast } = useToast()

  useEffect(() => {
    setProfile(userProfile)

    // Load settings from local storage
    try {
      // Load voice settings
      const savedVoiceSettings = localStorage.getItem('lark_voice_settings')
      if (savedVoiceSettings) {
        const voiceSettings = JSON.parse(savedVoiceSettings)
        setVoiceVolume(voiceSettings.volume || 80)
        setVoiceSpeed(voiceSettings.speed || 1)
        setVoiceType(voiceSettings.type || 'ash')
      }

      // Load app settings
      const savedAppSettings = localStorage.getItem('lark_app_settings')
      if (savedAppSettings) {
        const appSettings = JSON.parse(savedAppSettings)
        setOfflineMode(appSettings.offlineMode || false)
      }
    } catch (error) {
      console.error('Error loading settings from local storage:', error)
    }
  }, [userProfile])

  const handleSaveSettings = () => {
    // Update the user profile
    onUpdateProfile(profile)

    // Save settings to local storage
    try {
      localStorage.setItem('lark_user_profile', JSON.stringify(profile))
      localStorage.setItem('lark_voice_settings', JSON.stringify({
        volume: voiceVolume,
        speed: voiceSpeed,
        type: voiceType
      }))
      localStorage.setItem('lark_app_settings', JSON.stringify({
        offlineMode
      }))

      toast({
        title: "Settings saved",
        description: `Profile updated for ${getFormattedName()}`,
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your settings.",
        variant: "destructive"
      })
    }
  }

  const handleSyncData = () => {
    // In a real implementation, this would sync data with Firebase
    toast({
      title: "Data synced",
      description: "All data has been synchronized with the server",
    })
  }

  const getFormattedName = () => {
    if (profile.codename && profile.codename.trim() !== "") {
      return profile.codename
    }

    if (profile.rank && profile.lastName) {
      return `${profile.rank} ${profile.lastName}`
    }

    return profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : "Officer"
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              User Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rank" className="text-sm font-medium">
                Rank
              </Label>
              <Select value={profile.rank} onValueChange={(value) => setProfile({ ...profile, rank: value })}>
                <SelectTrigger id="rank" className="bg-secondary/50">
                  <SelectValue placeholder="Select your rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Officer">Officer</SelectItem>
                  <SelectItem value="Deputy">Deputy</SelectItem>
                  <SelectItem value="Sergeant">Sergeant</SelectItem>
                  <SelectItem value="Detective">Detective</SelectItem>
                  <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                  <SelectItem value="Captain">Captain</SelectItem>
                  <SelectItem value="Chief">Chief</SelectItem>
                  <SelectItem value="Sheriff">Sheriff</SelectItem>
                  <SelectItem value="Trooper">Trooper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="first-name"
                  className="bg-secondary/50"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last-name" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="last-name"
                  className="bg-secondary/50"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codename" className="text-sm font-medium">
                Codename (Optional)
              </Label>
              <Input
                id="codename"
                className="bg-secondary/50"
                value={profile.codename}
                onChange={(e) => setProfile({ ...profile, codename: e.target.value })}
                placeholder="How LARK should address you (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge-number" className="text-sm font-medium">
                Badge Number
              </Label>
              <Input
                id="badge-number"
                className="bg-secondary/50"
                value={profile.badgeNumber}
                onChange={(e) => setProfile({ ...profile, badgeNumber: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">
                Department
              </Label>
              <Input
                id="department"
                className="bg-secondary/50"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            </div>

            <div className="bg-primary/10 p-3 rounded-lg border border-primary/30 mt-2">
              <p className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                LARK will address you as: <strong>{getFormattedName()}</strong>
              </p>
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
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Voice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="voice-volume" className="text-sm font-medium">
                  Voice Volume
                </Label>
                <span>{voiceVolume}%</span>
              </div>
              <Slider
                id="voice-volume"
                min={0}
                max={100}
                step={1}
                value={[voiceVolume]}
                onValueChange={(value) => setVoiceVolume(value[0])}
                className="[&>span]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="voice-speed" className="text-sm font-medium">
                  Voice Speed
                </Label>
                <span>{voiceSpeed}x</span>
              </div>
              <Slider
                id="voice-speed"
                min={0.5}
                max={2}
                step={0.1}
                value={[voiceSpeed]}
                onValueChange={(value) => setVoiceSpeed(value[0])}
                className="[&>span]:bg-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voice-type" className="text-sm font-medium">
                Voice Type
              </Label>
              <Select value={voiceType} onValueChange={setVoiceType}>
                <SelectTrigger id="voice-type" className="bg-secondary/50">
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ash">Ash (Default)</SelectItem>
                  <SelectItem value="nova" disabled>
                    Nova
                  </SelectItem>
                  <SelectItem value="echo" disabled>
                    Echo
                  </SelectItem>
                  <SelectItem value="onyx" disabled>
                    Onyx
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Only Ash voice is available for LARK</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="offline-mode" className="font-medium">
                  Offline Mode
                </Label>
                <p className="text-sm text-muted-foreground">Use cached data when offline</p>
              </div>
              <Switch
                id="offline-mode"
                checked={offlineMode}
                onCheckedChange={setOfflineMode}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="background-audio" className="font-medium">
                  Background Audio Processing
                </Label>
                <p className="text-sm text-muted-foreground">Continue monitoring audio when app is in background</p>
              </div>
              <Switch id="background-audio" defaultChecked className="data-[state=checked]:bg-primary" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-dispatch" className="font-medium">
                  Automatic Dispatch Updates
                </Label>
                <p className="text-sm text-muted-foreground">Send location and status updates to dispatch</p>
              </div>
              <Switch id="auto-dispatch" defaultChecked className="data-[state=checked]:bg-primary" />
            </div>

            <div className="pt-4 flex gap-2">
              <Button
                onClick={handleSaveSettings}
                className="flex-1 gap-2 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
              <Button variant="outline" onClick={handleSyncData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Sync Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


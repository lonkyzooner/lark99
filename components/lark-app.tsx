"use client"

import { useState, useEffect, useRef } from "react"
import { VoiceInterface } from "@/components/voice-interface"
import { Navigation } from "@/components/navigation"
import { StatusBar } from "@/components/status-bar"
import { AssistantView } from "@/components/views/assistant-view"
import { MirandaView } from "@/components/views/miranda-view"
import { StatutesView } from "@/components/views/statutes-view"
import { ThreatsView } from "@/components/views/threats-view"
import { ToolsView } from "@/components/views/tools-view"
import { SettingsView, type UserProfile } from "@/components/views/settings-view"
import { useAudioProcessor } from "@/hooks/use-audio-processor"
import { useVoiceCommands } from "@/hooks/use-voice-commands"
import { useLiveKit } from "@/hooks/use-livekit"
import { useOfflineSupport } from "@/hooks/use-offline-support"
import { useAIService } from "@/hooks/use-ai-service"
import { VoiceService } from "@/lib/voice-service"
import { LarkAIService } from "@/lib/lark-ai-service"
import { motion } from "framer-motion"

export type ViewType = "assistant" | "miranda" | "statutes" | "threats" | "tools" | "settings"

export function LarkApp() {
  const [activeView, setActiveView] = useState<ViewType>("assistant")
  const [isListening, setIsListening] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; priority?: string }>>(
    [],
  )
  const [userProfile, setUserProfile] = useState<UserProfile>({
    rank: "Officer",
    firstName: "",
    lastName: "",
    codename: "",
    badgeNumber: "12345",
    department: "Police Department",
  })

  const voiceServiceRef = useRef<VoiceService>(VoiceService.getInstance())
  const larkServiceRef = useRef<LarkAIService>(LarkAIService.getInstance())

  const { startListening, stopListening, isProcessing } = useVoiceCommands({
    onCommand: (command) => {
      setMessages((prev) => [...prev, { role: "user", content: command }])
      processCommand(command)
    },
  })

  const { connectToLiveKit, disconnectFromLiveKit, liveKitStatus } = useLiveKit()
  const { detectThreats, audioLevel, isMonitoring, setMonitoring } = useAudioProcessor(userProfile)
  const { isOffline, cachedData } = useOfflineSupport()
  const {
    generateResponse,
    deliverMirandaRights,
    requestBackup,
    alertThreat,
    setOfflineMode,
    setCurrentActivity,
    isLoading,
  } = useAIService()

  useEffect(() => {
    // Check connection status
    const handleConnectionChange = () => {
      const online = navigator.onLine
      setIsConnected(online)
      setOfflineMode(!online)
    }

    window.addEventListener("online", handleConnectionChange)
    window.addEventListener("offline", handleConnectionChange)

    // Load saved user profile from localStorage if available
    const savedProfile = localStorage.getItem("larkUserProfile")
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile)
        setUserProfile(profile)
      } catch (e) {
        console.error("Failed to parse saved profile", e)
      }
    }

    // Initialize with a welcome message
    const welcomeMessage = getWelcomeMessage()
    setMessages([{ role: "assistant", content: welcomeMessage }])

    // Speak the welcome message
    voiceServiceRef.current.speak(welcomeMessage)

    return () => {
      window.removeEventListener("online", handleConnectionChange)
      window.removeEventListener("offline", handleConnectionChange)
    }
  }, [])

  // In a real implementation, this would initialize real threat detection
  // using actual audio processing

  const getWelcomeMessage = () => {
    const time = new Date().getHours()
    let greeting = "Good morning"

    if (time >= 12 && time < 17) {
      greeting = "Good afternoon"
    } else if (time >= 17) {
      greeting = "Good evening"
    }

    const userName = getUserName()

    return `${greeting}, ${userName}. LARK initialized and ready to assist. How can I help you today?`
  }

  const getUserName = () => {
    if (userProfile.codename && userProfile.codename.trim() !== "") {
      return userProfile.codename
    }

    if (userProfile.rank && userProfile.lastName) {
      return `${userProfile.rank} ${userProfile.lastName}`
    }

    return userProfile.firstName && userProfile.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : "Officer"
  }

  const handleThreatDetected = async (threat: string) => {
    try {
      const response = await alertThreat(threat, userProfile)

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.text,
          priority: response.priority,
        },
      ])

      // Handle any actions from the response
      if (response.action) {
        handleAIAction(response.action)
      }
    } catch (error) {
      console.error("Error handling threat detection:", error)
    }
  }

  const processCommand = async (command: string) => {
    // Set loading state
    setMessages((prev) => [...prev, { role: "assistant", content: "Processing..." }])

    try {
      // Use AI service to generate a response
      const aiResponse = await generateResponse(command, userProfile)

      // Update UI with the response
      setMessages((prev) => {
        const newMessages = [...prev]
        // Replace the "Processing..." message with the actual response
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: aiResponse.text,
          priority: aiResponse.priority,
        }
        return newMessages
      })

      // Handle any actions from the AI response
      if (aiResponse.action) {
        handleAIAction(aiResponse.action)
      }
    } catch (error) {
      console.error("Error processing command:", error)

      // Fallback response
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          role: "assistant",
          content: `I apologize, ${getUserName()}. I encountered an issue processing your request. Please try again.`,
        }
        return newMessages
      })

      // Speak the error message
      voiceServiceRef.current.speak(`I apologize, ${getUserName()}. I encountered an issue. Please try again.`)
    }
  }

  const handleAIAction = (action: any) => {
    // Handle different actions based on the AI response
    switch (action.type) {
      case "navigate":
        setActiveView(action.view as ViewType)
        break

      case "miranda":
        setActiveView("miranda")
        // Additional logic to set the language in the Miranda view would go here
        break

      case "statutes":
        setActiveView("statutes")
        break

      case "threats":
        setActiveView("threats")
        break

      case "dispatch":
        // In a real implementation, this would communicate with dispatch
        console.log("Dispatch action:", action)
        if (action.monitorAudio) {
          setMonitoring(true)
        }
        if (action.trackLocation) {
          // Start location tracking
          console.log("Starting location tracking")
        }
        break

      case "emergency":
        // Handle emergency actions
        console.log("Emergency action:", action)
        // This would trigger emergency protocols in a real implementation
        break

      case "translate":
        // Handle translation
        console.log("Translation action:", action)
        // This would use a translation service in a real implementation
        break

      case "threat_alert":
        // Handle threat alerts
        console.log("Threat alert:", action)
        break

      default:
        console.log("Unknown action type:", action.type)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
    } else {
      startListening()
      setIsListening(true)
    }
  }

  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile)
    // Save to localStorage
    localStorage.setItem("larkUserProfile", JSON.stringify(profile))

    // Update voice settings if needed
    const voiceOptions = {
      voice: "ash", // Always use Ash voice
      speed: 1.0,
      volume: 1.0,
    }
    voiceServiceRef.current.setDefaultOptions(voiceOptions)
  }

  const handleManualCommand = (text: string) => {
    if (text.trim()) {
      setMessages((prev) => [...prev, { role: "user", content: text }])
      processCommand(text)
    }
  }

  return (
    <div className="flex flex-col w-full h-screen max-h-screen bg-background">
      <StatusBar
        isListening={isListening}
        isConnected={isConnected}
        isProcessing={isProcessing}
        audioLevel={audioLevel}
        liveKitStatus={liveKitStatus}
        userName={getUserName()}
      />

      <motion.div
        className="flex-1 overflow-hidden flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {activeView === "assistant" && <AssistantView messages={messages} userName={getUserName()} />}
        {activeView === "miranda" && (
          <MirandaView isOffline={isOffline} cachedData={cachedData} userProfile={userProfile} />
        )}
        {activeView === "statutes" && <StatutesView isOffline={isOffline} cachedData={cachedData} />}
        {activeView === "threats" && <ThreatsView userProfile={userProfile} />}
        {activeView === "tools" && <ToolsView userProfile={userProfile} />}
        {activeView === "settings" && <SettingsView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />}
      </motion.div>

      <div className="border-t border-border/30 bg-card">
        <VoiceInterface
          isListening={isListening}
          toggleListening={toggleListening}
          isProcessing={isProcessing}
          onManualCommand={handleManualCommand}
        />
        <Navigation activeView={activeView} setActiveView={setActiveView} />
      </div>
    </div>
  )
}


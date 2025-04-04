"use client"

import { useState } from "react"
import type { UserProfile } from "@/components/views/settings-view"
import { LarkAIService } from "@/lib/lark-ai-service"

interface AIResponse {
  text: string
  action?: {
    type: string
    [key: string]: any
  }
  priority?: "normal" | "high" | "emergency"
}

export function useAIService() {
  const [isLoading, setIsLoading] = useState(false)
  const larkService = LarkAIService.getInstance()

  const generateResponse = async (userInput: string, userProfile: UserProfile): Promise<AIResponse> => {
    setIsLoading(true)

    try {
      // Process the command through the LARK AI service
      const response = await larkService.processCommand(userInput, userProfile)

      return {
        text: response.text,
        action: response.action,
        priority: response.priority,
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const deliverMirandaRights = async (language: string, userProfile: UserProfile): Promise<AIResponse> => {
    setIsLoading(true)

    try {
      const response = await larkService.deliverMirandaRights(language, userProfile)

      return {
        text: response.text,
        action: response.action,
      }
    } catch (error) {
      console.error("Error delivering Miranda Rights:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const requestBackup = async (situation: string, userProfile: UserProfile): Promise<AIResponse> => {
    setIsLoading(true)

    try {
      const response = await larkService.requestBackup(situation, userProfile)

      return {
        text: response.text,
        action: response.action,
        priority: response.priority,
      }
    } catch (error) {
      console.error("Error requesting backup:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const alertThreat = async (threat: string, userProfile: UserProfile): Promise<AIResponse> => {
    try {
      const response = await larkService.alertThreat(threat, userProfile)

      return {
        text: response.text,
        action: response.action,
        priority: response.priority,
      }
    } catch (error) {
      console.error("Error alerting threat:", error)
      throw error
    }
  }

  const setOfflineMode = (isOffline: boolean) => {
    larkService.setOfflineMode(isOffline)
  }

  const setCurrentActivity = (activity: string) => {
    larkService.setCurrentActivity(activity)
  }

  return {
    generateResponse,
    deliverMirandaRights,
    requestBackup,
    alertThreat,
    setOfflineMode,
    setCurrentActivity,
    isLoading,
  }
}


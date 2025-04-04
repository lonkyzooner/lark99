import type { UserProfile } from "@/components/views/settings-view"
import { VoiceService } from "./voice-service"

export interface LarkResponse {
  text: string
  voiceText?: string // Optional different text for voice output
  action?: {
    type: string
    [key: string]: any
  }
  priority?: "normal" | "high" | "emergency"
}

export interface LarkContext {
  location?: { latitude: number; longitude: number }
  recentCommands: string[]
  detectedThreats: string[]
  isOffline: boolean
  currentActivity?: string
}

export class LarkAIService {
  private static instance: LarkAIService
  private voiceService: VoiceService
  private context: LarkContext = {
    recentCommands: [],
    detectedThreats: [],
    isOffline: false,
  }

  private constructor() {
    this.voiceService = VoiceService.getInstance()
  }

  public static getInstance(): LarkAIService {
    if (!LarkAIService.instance) {
      LarkAIService.instance = new LarkAIService()
    }
    return LarkAIService.instance
  }

  public updateContext(partialContext: Partial<LarkContext>): void {
    this.context = { ...this.context, ...partialContext }
  }

  public setOfflineMode(isOffline: boolean): void {
    this.context.isOffline = isOffline
  }

  public addRecentCommand(command: string): void {
    this.context.recentCommands.unshift(command)
    // Keep only the last 5 commands
    if (this.context.recentCommands.length > 5) {
      this.context.recentCommands.pop()
    }
  }

  public addDetectedThreat(threat: string): void {
    this.context.detectedThreats.unshift(threat)
    // Keep only the last 5 threats
    if (this.context.detectedThreats.length > 5) {
      this.context.detectedThreats.pop()
    }
  }

  public setCurrentActivity(activity: string): void {
    this.context.currentActivity = activity
  }

  public async processCommand(command: string, userProfile: UserProfile): Promise<LarkResponse> {
    // Add to recent commands
    this.addRecentCommand(command)

    // In a real implementation, this would call the OpenAI or Groq API
    // For demo purposes, we'll use a rule-based system

    const userName = this.getUserName(userProfile)
    const input = command.toLowerCase()
    let response: LarkResponse = { text: "" }

    // Process based on command patterns
    if (input.includes("chase") || input.includes("pursuit") || input.includes("following suspect")) {
      response = {
        text: `Tracking your location now, ${userName}. I will send updates to dispatch. Keep your eyes on the suspect.`,
        action: {
          type: "dispatch",
          message: "Officer in pursuit",
          requestBackup: true,
          trackLocation: true,
        },
        priority: "high",
      }
      this.setCurrentActivity("pursuit")
    } else if (
      input.includes("spanish") ||
      input.includes("mandarin") ||
      input.includes("french") ||
      input.includes("vietnamese")
    ) {
      let language = "Spanish"
      if (input.includes("mandarin")) language = "Mandarin"
      if (input.includes("french")) language = "French"
      if (input.includes("vietnamese")) language = "Vietnamese"

      if (input.includes("miranda")) {
        response = {
          text: `Delivering Miranda Rights in ${language} now. I will translate any responses for you.`,
          action: {
            type: "miranda",
            language: language.toLowerCase(),
          },
        }
      } else {
        response = {
          text: `Translating to ${language} now. I will facilitate communication for you.`,
          action: {
            type: "translate",
            language: language.toLowerCase(),
          },
        }
      }
    } else if (input.includes("miranda")) {
      response = {
        text: `Delivering Miranda Rights now, ${userName}.`,
        action: {
          type: "miranda",
          language: "english",
        },
      }
    } else if (input.includes("domestic") || input.includes("disturbance")) {
      response = {
        text: `Notifying dispatch of your location and situation now, ${userName}. I will monitor audio for signs of escalation and alert backup if needed.`,
        action: {
          type: "dispatch",
          message: "Responding to domestic disturbance",
          monitorAudio: true,
        },
        priority: "high",
      }
      this.setCurrentActivity("domestic_call")
    } else if (input.includes("backup") || input.includes("help") || input.includes("emergency")) {
      response = {
        text: `Requesting backup from dispatch now, ${userName}. I will monitor audio for threats and provide updates. Stay safe.`,
        voiceText: `Requesting backup now, ${userName}. Stay safe.`,
        action: {
          type: "emergency",
          requestBackup: true,
          priority: "high",
        },
        priority: "emergency",
      }
    } else if (input.includes("risk") || input.includes("threat") || input.includes("assess")) {
      if (this.context.detectedThreats.length > 0) {
        const latestThreat = this.context.detectedThreats[0]
        response = {
          text: `${latestThreat} detected—proceed with extreme caution, ${userName}.`,
          action: {
            type: "threat_alert",
            threat: latestThreat,
          },
          priority: "high",
        }
      } else {
        response = {
          text: `No recent threats detected, ${userName}. Proceed with standard protocol.`,
          action: {
            type: "threat_assessment",
            result: "clear",
          },
        }
      }
    } else if (input.includes("statute") || input.includes("law") || input.includes("code")) {
      response = {
        text: `Opening statute lookup for you, ${userName}. What specific statute are you looking for?`,
        action: {
          type: "statutes",
        },
      }
    } else if (input.includes("report")) {
      response = {
        text: `I'll help you write a report, ${userName}. Let me take you to the report writing tool.`,
        action: {
          type: "navigate",
          view: "tools",
        },
      }
    } else if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      response = {
        text: `Hello ${userName}! I'm here to assist you. How can I help with your current activities?`,
      }
    } else {
      // Context-aware default response
      if (this.context.currentActivity === "pursuit") {
        response = {
          text: `Still tracking your pursuit, ${userName}. Dispatch has been updated with your current location. Do you need backup?`,
        }
      } else if (this.context.currentActivity === "domestic_call") {
        response = {
          text: `I'm monitoring the situation, ${userName}. No threats detected so far. Let me know if you need anything specific.`,
        }
      } else {
        response = {
          text: `I understand, ${userName}. I'm here to assist with Miranda rights, statute lookups, threat detection, or report writing. What do you need?`,
        }
      }
    }

    // Speak the response using Ash voice
    const textToSpeak = response.voiceText || response.text
    await this.voiceService.speak(textToSpeak)

    return response
  }

  public async speakAlert(text: string, priority: "normal" | "high" | "emergency" = "normal"): Promise<void> {
    // Adjust volume based on priority
    const volume = priority === "emergency" ? 1.0 : priority === "high" ? 0.9 : 0.8

    await this.voiceService.speak(text, { volume })
  }

  private getUserName(profile: UserProfile): string {
    if (profile.codename && profile.codename.trim() !== "") {
      return profile.codename
    }

    if (profile.rank && profile.lastName) {
      return `${profile.rank} ${profile.lastName}`
    }

    return profile.firstName && profile.lastName ? `${profile.firstName} ${profile.lastName}` : "Officer"
  }

  // Methods for specific law enforcement functions

  public async deliverMirandaRights(language = "english", userProfile: UserProfile): Promise<LarkResponse> {
    const userName = this.getUserName(userProfile)
    const offlineNote = this.context.isOffline ? " Using cached offline data." : ""

    const response: LarkResponse = {
      text: `Delivering Miranda Rights in ${language}${offlineNote}, ${userName}.`,
      action: {
        type: "miranda",
        language,
      },
    }

    // Speak the Miranda rights
    await this.voiceService.speak(response.text)

    return response
  }

  public async requestBackup(situation: string, userProfile: UserProfile): Promise<LarkResponse> {
    const userName = this.getUserName(userProfile)

    const response: LarkResponse = {
      text: `Emergency backup requested, ${userName}. Dispatch has been notified of your situation and location. Stay safe.`,
      voiceText: `Backup requested, ${userName}. Stay safe.`,
      action: {
        type: "emergency",
        requestBackup: true,
        situation,
      },
      priority: "emergency",
    }

    // Speak the emergency alert
    await this.speakAlert(response.voiceText || response.text, "emergency")

    return response
  }

  public async translateCommunication(text: string, language: string, userProfile: UserProfile): Promise<LarkResponse> {
    const userName = this.getUserName(userProfile)
    const offlineNote = this.context.isOffline ? " Using cached offline data." : ""

    const response: LarkResponse = {
      text: `Translating to ${language}${offlineNote}, ${userName}. "${text}"`,
      action: {
        type: "translate",
        language,
        originalText: text,
      },
    }

    // Speak the translation
    await this.voiceService.speak(response.text)

    return response
  }

  public async alertThreat(threat: string, userProfile: UserProfile): Promise<LarkResponse> {
    const userName = this.getUserName(userProfile)

    const response: LarkResponse = {
      text: `ALERT ${userName}: ${threat} detected. Proceed with caution.`,
      action: {
        type: "threat_alert",
        threat,
      },
      priority: "high",
    }

    // Add to detected threats
    this.addDetectedThreat(threat)

    // Speak the alert with high priority
    await this.speakAlert(response.text, "high")

    return response
  }
}


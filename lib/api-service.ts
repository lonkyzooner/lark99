/**
 * API Service for LARK
 *
 * This service handles all external API calls to:
 * - OpenAI (for GPT and TTS)
 * - LiveKit (for real-time audio)
 * - HuggingFace (for specialized models)
 * - Groq (for alternative LLM)
 */

import { UserProfile } from "@/components/views/settings-view"

// API Response Types
export interface AICompletionResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface TTSResponse {
  audioUrl: string
  duration: number
}

export interface AudioAnalysisResponse {
  detectedThreats: string[]
  confidence: number
}

export interface ApiService {
  // Voice processing
  processVoiceCommand: (audioData: Blob) => Promise<string>
  synthesizeSpeech: (text: string, voice: string) => Promise<ArrayBuffer>

  // Threat detection
  analyzeAudioForThreats: (audioData: Blob) => Promise<string | null>

  // Dispatch communication
  sendLocationToDispatch: (latitude: number, longitude: number) => Promise<void>
  requestBackup: (latitude: number, longitude: number, situation: string) => Promise<void>

  // Data retrieval
  getMirandaRights: (language: string) => Promise<string>
  searchStatutes: (query: string) => Promise<any[]>
  getStatuteById: (id: string) => Promise<any>

  // AI completions
  generateCompletion: (prompt: string, context?: any, useGroq?: boolean) => Promise<AICompletionResponse>

  // Report analysis
  analyzeReport: (content: string, reportData: any) => Promise<any>
}

// Main API Service Class
export class APIService implements ApiService {
  private static instance: APIService
  private apiBaseUrl: string
  private isOffline: boolean = false

  private constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  public static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService()
    }
    return APIService.instance
  }

  public setOfflineMode(isOffline: boolean): void {
    this.isOffline = isOffline
  }

  /**
   * Process voice command using OpenAI Whisper API
   */
  public async processVoiceCommand(audioData: Blob): Promise<string> {
    if (this.isOffline) {
      throw new Error('Voice processing not available offline')
    }

    try {
      const formData = new FormData()
      formData.append('audio', audioData)

      const response = await fetch(`${this.apiBaseUrl}/api/voice/process`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.text
    } catch (error) {
      console.error('Error processing voice command:', error)
      throw error
    }
  }

  /**
   * Generate text-to-speech using OpenAI's TTS API
   */
  public async synthesizeSpeech(text: string, voice: string = 'ash'): Promise<ArrayBuffer> {
    if (this.isOffline) {
      throw new Error('Speech synthesis not available offline')
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/ai/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.error('Error generating speech:', error)
      throw error
    }
  }

  /**
   * Analyze audio for threats using HuggingFace models
   */
  public async analyzeAudioForThreats(audioData: Blob): Promise<string | null> {
    if (this.isOffline) {
      return null
    }

    try {
      const formData = new FormData()
      formData.append('audio', audioData)

      const response = await fetch(`${this.apiBaseUrl}/api/audio/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.detectedThreats.length > 0 ? data.detectedThreats[0] : null
    } catch (error) {
      console.error('Error analyzing audio:', error)
      return null
    }
  }

  /**
   * Send officer location to dispatch
   */
  public async sendLocationToDispatch(latitude: number, longitude: number): Promise<void> {
    if (this.isOffline) {
      console.log('Location update queued for when connection is restored')
      return
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/dispatch/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error sending location to dispatch:', error)
      throw error
    }
  }

  /**
   * Request backup at current location
   */
  public async requestBackup(latitude: number, longitude: number, situation: string): Promise<void> {
    if (this.isOffline) {
      console.log('Backup request queued for when connection is restored')
      return
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/dispatch/backup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          situation,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {
      console.error('Error requesting backup:', error)
      throw error
    }
  }

  /**
   * Get Miranda Rights in specified language
   */
  public async getMirandaRights(language: string): Promise<string> {
    try {
      // Try to get from cache first if offline
      if (this.isOffline) {
        const cachedRights = localStorage.getItem(`miranda_${language}`)
        if (cachedRights) {
          return cachedRights
        }
        return 'Miranda Rights not available offline for this language.'
      }

      const response = await fetch(`${this.apiBaseUrl}/api/miranda?language=${encodeURIComponent(language)}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Cache for offline use
      try {
        localStorage.setItem(`miranda_${language}`, data.text)
      } catch (e) {
        console.warn('Could not cache Miranda Rights:', e)
      }

      return data.text
    } catch (error) {
      console.error('Error getting Miranda Rights:', error)
      throw error
    }
  }

  /**
   * Search statutes based on query
   */
  public async searchStatutes(query: string): Promise<any[]> {
    try {
      // Try to get from cache first if offline
      if (this.isOffline) {
        const cachedResults = localStorage.getItem(`statutes_search_${query}`)
        if (cachedResults) {
          return JSON.parse(cachedResults)
        }
        return []
      }

      const response = await fetch(`${this.apiBaseUrl}/api/statutes/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Cache for offline use
      try {
        localStorage.setItem(`statutes_search_${query}`, JSON.stringify(data.results))
      } catch (e) {
        console.warn('Could not cache statute search results:', e)
      }

      return data.results
    } catch (error) {
      console.error('Error searching statutes:', error)
      return []
    }
  }

  /**
   * Get statute by ID
   */
  public async getStatuteById(id: string): Promise<any> {
    try {
      // Try to get from cache first if offline
      if (this.isOffline) {
        const cachedStatute = localStorage.getItem(`statute_${id}`)
        if (cachedStatute) {
          return JSON.parse(cachedStatute)
        }
        throw new Error('Statute not available offline')
      }

      const response = await fetch(`${this.apiBaseUrl}/api/statutes/${encodeURIComponent(id)}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Cache for offline use
      try {
        localStorage.setItem(`statute_${id}`, JSON.stringify(data))
      } catch (e) {
        console.warn('Could not cache statute:', e)
      }

      return data
    } catch (error) {
      console.error('Error getting statute:', error)
      throw error
    }
  }

  /**
   * Create a LiveKit token for real-time audio
   */
  public async getLiveKitToken(userName: string, room: string): Promise<string> {
    if (this.isOffline) {
      throw new Error('LiveKit not available offline')
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/api/livekit/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName,
          room,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      return data.token
    } catch (error) {
      console.error('Error getting LiveKit token:', error)
      throw error
    }
  }

  /**
   * Generate AI completion using OpenAI or Groq
   */
  public async generateCompletion(prompt: string, context?: any, useGroq: boolean = false): Promise<AICompletionResponse> {
    try {
      // If offline, provide a basic response
      if (this.isOffline) {
        return {
          text: "I'm currently in offline mode. I can assist with basic tasks, but my capabilities are limited without an internet connection."
        }
      }

      const response = await fetch(`${this.apiBaseUrl}/api/ai/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          useGroq,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating AI completion:', error)
      return {
        text: "I encountered an error processing your request. Please try again later."
      }
    }
  }

  /**
   * Analyze a police report from a defense attorney perspective
   */
  public async analyzeReport(content: string, reportData: any): Promise<any> {
    try {
      // If offline, provide basic feedback
      if (this.isOffline) {
        return {
          feedback: [
            {
              type: "clarity",
              text: "Offline mode: Unable to perform detailed report analysis.",
              suggestion: "Connect to the internet for comprehensive report analysis."
            }
          ]
        }
      }

      const response = await fetch(`${this.apiBaseUrl}/api/report/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          reportData,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error analyzing report:', error)
      // Return a minimal response in case of error
      return {
        feedback: [
          {
            type: "clarity",
            text: "An error occurred during report analysis.",
            suggestion: "Please try again later."
          }
        ]
      }
    }
  }
}
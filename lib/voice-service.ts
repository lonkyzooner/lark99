// Voice service for LARK using OpenAI's Ash voice via LiveKit

export interface VoiceOptions {
  voice: string
  speed: number
  volume: number
}

export class VoiceService {
  private static instance: VoiceService
  private audioContext: AudioContext | null = null
  private audioQueue: Array<{ text: string; options: VoiceOptions }> = []
  private isPlaying = false
  private defaultOptions: VoiceOptions = {
    voice: "ash", // Default to Ash voice
    speed: 1.0,
    volume: 1.0,
  }

  private constructor() {
    // Initialize audio context on user interaction
    if (typeof window !== "undefined") {
      const initAudio = () => {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        window.removeEventListener("click", initAudio)
      }
      window.addEventListener("click", initAudio)
    }
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService()
    }
    return VoiceService.instance
  }

  public async speak(text: string, options?: Partial<VoiceOptions>): Promise<void> {
    const fullOptions = { ...this.defaultOptions, ...options }

    // Add to queue
    this.audioQueue.push({ text, options: fullOptions })

    // Start processing queue if not already playing
    if (!this.isPlaying) {
      this.processQueue()
    }
  }

  public stop(): void {
    // Clear the queue
    this.audioQueue = []
    this.isPlaying = false

    // In a real implementation, this would stop any currently playing audio
    console.log("Stopped voice playback")
  }

  public setDefaultOptions(options: Partial<VoiceOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options }
  }

  private async processQueue(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true
    const { text, options } = this.audioQueue.shift()!

    try {
      // In a real implementation, this would call the OpenAI TTS API with Ash voice via LiveKit
      console.log(`Voice service would speak: "${text}"`)

      // For now, we'll just log the text and move on immediately
      // A real implementation would play audio here

      // Process the next item in the queue
      this.processQueue()
    } catch (error) {
      console.error("Error during speech synthesis:", error)
      this.isPlaying = false
    }
  }

  public get isSpeaking(): boolean {
    return this.isPlaying
  }
}


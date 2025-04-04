"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface VoiceInterfaceProps {
  isListening: boolean
  toggleListening: () => void
  isProcessing: boolean
  onManualCommand: (command: string) => void
}

export function VoiceInterface({ isListening, toggleListening, isProcessing, onManualCommand }: VoiceInterfaceProps) {
  const [manualInput, setManualInput] = useState("")
  const [placeholder, setPlaceholder] = useState("Type a command...")
  const [pulseAnimation, setPulseAnimation] = useState(false)

  useEffect(() => {
    if (isListening) {
      const placeholders = ["Listening...", "I'm listening...", "Speak now...", "Go ahead...", "I'm ready..."]

      // Rotate through different placeholders while listening
      let index = 0
      const interval = setInterval(() => {
        setPlaceholder(placeholders[index % placeholders.length])
        index++
      }, 2000)

      // Add pulse animation
      setPulseAnimation(true)

      return () => {
        clearInterval(interval)
        setPulseAnimation(false)
        setPlaceholder("Type a command...")
      }
    }
  }, [isListening])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualInput.trim()) {
      onManualCommand(manualInput)
      setManualInput("")
    }
  }

  return (
    <div className="p-4 bg-card">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            type="button"
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="icon"
            className={`rounded-full h-12 w-12 flex-shrink-0 shadow-lg ${isListening ? "bg-destructive" : "bg-primary"}`}
            disabled={isProcessing}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-2 border-destructive animate-pulse-ring"></span>
            )}
          </Button>
        </motion.div>

        <div className="relative flex-1">
          <input
            type="text"
            placeholder={isListening ? placeholder : "Type a command..."}
            className="w-full px-4 py-3 rounded-full border border-border/50 bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 shadow-sm"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            disabled={isListening || isProcessing}
          />
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className={`rounded-full h-10 w-10 ${!manualInput.trim() || isProcessing ? "text-muted-foreground" : "text-primary"}`}
            disabled={!manualInput.trim() || isProcessing}
          >
            <Send className="h-5 w-5" />
          </Button>
        </motion.div>
      </form>
    </div>
  )
}


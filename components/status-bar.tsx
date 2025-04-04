"use client"

import { cn } from "@/lib/utils"
import { Wifi, WifiOff, Mic, MicOff, Signal, User, Shield } from "lucide-react"
import { motion } from "framer-motion"

interface StatusBarProps {
  isListening: boolean
  isConnected: boolean
  isProcessing: boolean
  audioLevel: number
  liveKitStatus: "connected" | "connecting" | "disconnected"
  userName: string
}

export function StatusBar({
  isListening,
  isConnected,
  isProcessing,
  audioLevel,
  liveKitStatus,
  userName,
}: StatusBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border/30 backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        <Shield className="h-5 w-5 text-primary" />
        <div className="flex flex-col">
          <span className="font-bold text-sm">LARK</span>
          <span className="text-xs text-muted-foreground">v1.0</span>
        </div>
      </div>

      <motion.div
        className="flex items-center space-x-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <User className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{userName}</span>
      </motion.div>

      <div className="flex items-center space-x-4">
        {/* Audio level indicator */}
        <div className="audio-wave h-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="bar"
              style={{
                height: `${Math.min(100, (audioLevel / 100) * level * 20)}%`,
                opacity: audioLevel >= level * 20 ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        {/* Listening status */}
        <div className="flex items-center">
          {isListening ? (
            <div className="relative">
              <Mic className="h-4 w-4 text-primary animate-pulse" />
              <div className="absolute inset-0 rounded-full border border-primary animate-pulse-ring opacity-75"></div>
            </div>
          ) : (
            <MicOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Connection status */}
        <div className="flex items-center">
          {isConnected ? <Wifi className="h-4 w-4 text-primary" /> : <WifiOff className="h-4 w-4 text-destructive" />}
        </div>

        {/* LiveKit status */}
        <div className="flex items-center">
          <Signal
            className={cn(
              "h-4 w-4",
              liveKitStatus === "connected"
                ? "text-primary"
                : liveKitStatus === "connecting"
                  ? "text-amber-400"
                  : "text-muted-foreground",
            )}
          />
        </div>
      </div>
    </div>
  )
}


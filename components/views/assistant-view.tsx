"use client"

import { useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Shield } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  priority?: string
}

interface AssistantViewProps {
  messages: Message[]
  userName: string
}

export function AssistantView({ messages, userName }: AssistantViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-primary text-white p-4 shadow-md">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <div>
            <h2 className="text-lg font-semibold">LARK Assistant</h2>
            <p className="text-sm text-primary-foreground/80">Your personal law enforcement partner</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Shield className="h-16 w-16 mb-4 text-muted-foreground/30" />
              <p className="font-medium">No conversation history yet.</p>
              <p className="text-sm">Say "Hey LARK" or type a command to get started.</p>
            </motion.div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={index}
                className={cn(
                  "flex items-start gap-3 max-w-[85%]",
                  message.role === "assistant" ? "mr-auto" : "ml-auto flex-row-reverse",
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src="/placeholder.svg?height=36&width=36" alt="LARK" />
                    <AvatarFallback className="bg-primary/10 text-primary">LA</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "rounded-2xl p-3 shadow-sm",
                    message.role === "assistant"
                      ? message.priority === "high" || message.priority === "emergency"
                        ? "bg-destructive/10 border border-destructive/30 text-foreground"
                        : "bg-card border border-border/50 text-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {message.content === "Processing..." ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                      <p>Processing your request...</p>
                    </div>
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                </div>

                {message.role === "user" && (
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src="/placeholder.svg?height=36&width=36" alt={userName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {userName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}


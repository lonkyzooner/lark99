"use client"

import type { ViewType } from "@/components/lark-app"
import { cn } from "@/lib/utils"
import { MessageSquare, Book, Scale, AlertTriangle, PenToolIcon as Tool, Settings } from "lucide-react"
import { motion } from "framer-motion"

interface NavigationProps {
  activeView: ViewType
  setActiveView: (view: ViewType) => void
}

export function Navigation({ activeView, setActiveView }: NavigationProps) {
  const navItems = [
    { id: "assistant" as ViewType, icon: MessageSquare, label: "Assistant" },
    { id: "miranda" as ViewType, icon: Book, label: "Miranda" },
    { id: "statutes" as ViewType, icon: Scale, label: "Statutes" },
    { id: "threats" as ViewType, icon: AlertTriangle, label: "Threats" },
    { id: "tools" as ViewType, icon: Tool, label: "Tools" },
    { id: "settings" as ViewType, icon: Settings, label: "Settings" },
  ]

  return (
    <nav className="flex justify-around items-center p-2 bg-card">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveView(item.id)}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
            activeView === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
          )}
        >
          <div className="relative">
            <item.icon className="h-5 w-5" />
            {activeView === item.id && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </div>
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}


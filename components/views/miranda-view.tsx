"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Book, Globe } from "lucide-react"
import { VoiceService } from "@/lib/voice-service"
import type { UserProfile } from "@/components/views/settings-view"
import { motion } from "framer-motion"

interface MirandaViewProps {
  isOffline: boolean
  cachedData: any
  userProfile: UserProfile
}

export function MirandaView({ isOffline, cachedData, userProfile }: MirandaViewProps) {
  const [language, setLanguage] = useState("english")
  const [isPlaying, setIsPlaying] = useState(false)
  const [voiceService] = useState(() => VoiceService.getInstance())

  // This would come from Firebase in a real implementation
  const mirandaRights = {
    english: `You have the right to remain silent. Anything you say can and will be used against you in a court of law. You have the right to an attorney. If you cannot afford an attorney, one will be provided for you. Do you understand the rights I have just read to you? With these rights in mind, do you wish to speak to me?`,
    spanish: `Tiene derecho a guardar silencio. Cualquier cosa que diga puede y será usada en su contra en un tribunal. Tiene derecho a un abogado. Si no puede pagar un abogado, se le proporcionará uno. ¿Entiende los derechos que le acabo de leer? Con estos derechos en mente, ¿desea hablar conmigo?`,
    french: `Vous avez le droit de garder le silence. Tout ce que vous direz pourra être utilisé contre vous devant un tribunal. Vous avez droit à un avocat. Si vous ne pouvez pas vous permettre un avocat, un vous sera fourni. Comprenez-vous les droits que je viens de vous lire? Avec ces droits à l'esprit, souhaitez-vous me parler?`,
    mandarin: `您有权保持沉默。您所说的任何话都可以并将在法庭上用作对您不利的证据。您有权获得律师帮助。如果您无法负担律师费用，将为您提供一位律师。您理解我刚才向您宣读的权利吗？考虑到这些权利，您是否愿意与我交谈？`,
    vietnamese: `Bạn có quyền giữ im lặng. Bất cứ điều gì bạn nói có thể và sẽ được sử dụng chống lại bạn trong tòa án. Bạn có quyền có luật sư. Nếu bạn không có khả năng chi trả cho một luật sư, một luật sư sẽ được cung cấp cho bạn. Bạn có hiểu các quyền mà tôi vừa đọc cho bạn không? Với những quyền này trong tâm trí, bạn có muốn nói chuyện với tôi không?`,
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      voiceService.stop()
      setIsPlaying(false)
    } else {
      setIsPlaying(true)

      // Get the Miranda rights text for the selected language
      const mirandaText = mirandaRights[language as keyof typeof mirandaRights]

      // Use the voice service to speak the Miranda rights
      voiceService
        .speak(mirandaText, { voice: "ash" })
        .then(() => {
          setIsPlaying(false)
        })
        .catch((error) => {
          console.error("Error speaking Miranda rights:", error)
          setIsPlaying(false)
        })
    }
  }

  useEffect(() => {
    // Stop speaking if the component unmounts
    return () => {
      if (isPlaying) {
        voiceService.stop()
      }
    }
  }, [isPlaying, voiceService])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Book className="h-5 w-5 text-primary" />
                <span>Miranda Rights</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <SelectValue placeholder="Language" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="mandarin">Mandarin</SelectItem>
                  <SelectItem value="vietnamese">Vietnamese</SelectItem>
                </SelectContent>
              </Select>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-5 bg-secondary/50 rounded-xl border border-border/50 shadow-sm">
              <p className="whitespace-pre-line leading-relaxed">
                {mirandaRights[language as keyof typeof mirandaRights]}
              </p>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handlePlayPause}
                className="gap-2 px-6 py-5 h-auto rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                variant={isPlaying ? "destructive" : "default"}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    <span className="font-medium">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    <span className="font-medium">Read Aloud</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isOffline && (
        <motion.div
          className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-700 dark:text-amber-400"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <p className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-wifi-off"
            >
              <line x1="2" x2="22" y1="2" y2="22"></line>
              <path d="M8.5 16.5a5 5 0 0 1 7 0"></path>
              <path d="M2 8.82a15 15 0 0 1 4.17-2.65"></path>
              <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"></path>
              <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"></path>
              <path d="M5 13a10 10 0 0 1 5.24-2.76"></path>
              <line x1="12" x2="12.01" y1="20" y2="20"></line>
            </svg>
            You are currently offline. Using cached Miranda Rights data.
          </p>
        </motion.div>
      )}
    </div>
  )
}


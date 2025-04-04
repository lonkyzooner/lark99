"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Room, RoomEvent, LocalParticipant, RemoteParticipant, Track } from 'livekit-client'
import { APIService } from "@/lib/api-service"

export function useLiveKit() {
  const [liveKitStatus, setLiveKitStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected")
  const [room, setRoom] = useState<Room | null>(null)
  const hasConnectedRef = useRef(false)
  const apiServiceRef = useRef<APIService>(APIService.getInstance())

  const connectToLiveKit = useCallback(async (userName: string = 'Officer', roomName: string = 'lark-default') => {
    if (liveKitStatus === "connecting") return

    setLiveKitStatus("connecting")

    try {
      // Get LiveKit URL from environment variable
      let livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

      if (!livekitUrl) {
        console.warn("LiveKit URL not configured, using fallback")
        // Use a fallback URL for development or testing
        // In production, this should be properly configured in Vercel
        livekitUrl = "wss://lark-livekit.livekit.cloud"
        console.log(`Using fallback LiveKit URL: ${livekitUrl}`)
      }

      console.log("Connecting to LiveKit...")

      // Get token from API
      const token = await apiServiceRef.current.getLiveKitToken(userName, roomName)

      // Create and connect to the room
      const newRoom = new Room()

      // Set up event listeners
      newRoom.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
        console.log(`Participant connected: ${participant.identity}`)
      })

      newRoom.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
        console.log(`Participant disconnected: ${participant.identity}`)
      })

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log("Disconnected from room")
        setLiveKitStatus("disconnected")
      })

      // Connect to the room
      await newRoom.connect(livekitUrl, token)
      console.log("Connected to LiveKit room:", roomName)

      setRoom(newRoom)
      setLiveKitStatus("connected")

      return newRoom
    } catch (error) {
      console.error("Failed to connect to LiveKit:", error)
      setLiveKitStatus("disconnected")
      throw error
    }
  }, [liveKitStatus])

  const disconnectFromLiveKit = useCallback(() => {
    console.log("Disconnecting from LiveKit...")

    if (room) {
      room.disconnect()
      setRoom(null)
    }

    setLiveKitStatus("disconnected")
  }, [room])

  const publishAudioTrack = useCallback(
    async (track: MediaStreamTrack) => {
      if (room && liveKitStatus === "connected") {
        try {
          await room.localParticipant.publishTrack(track)
          console.log("Published audio track to LiveKit")
        } catch (error) {
          console.error("Failed to publish audio track:", error)
          throw error
        }
      } else {
        throw new Error("Cannot publish track: not connected to LiveKit")
      }
    },
    [room, liveKitStatus],
  )

  const unpublishAudioTrack = useCallback(
    async (track: MediaStreamTrack) => {
      if (room && liveKitStatus === "connected") {
        try {
          await room.localParticipant.unpublishTrack(track)
          console.log("Unpublished audio track from LiveKit")
        } catch (error) {
          console.error("Failed to unpublish audio track:", error)
          throw error
        }
      }
    },
    [room, liveKitStatus],
  )

  // Don't auto-connect on mount - let the app decide when to connect
  // This prevents unnecessary connections when the feature isn't being used

  return {
    liveKitStatus,
    connectToLiveKit,
    disconnectFromLiveKit,
    publishAudioTrack,
    unpublishAudioTrack,
    room,
  }
}


import { NextApiRequest, NextApiResponse } from 'next'
import { AccessToken } from 'livekit-server-sdk'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userName, room } = req.body

    if (!userName || !room) {
      return res.status(400).json({ error: 'userName and room are required' })
    }

    // Get LiveKit API key and secret from environment variables
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'LiveKit API key or secret not configured' })
    }

    // Create a new token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: userName,
    })

    // Grant permissions to the room
    at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true })

    // Generate the token
    const token = at.toJwt()

    return res.status(200).json({ token })
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error)
    return res.status(500).json({ error: error.message || 'Error generating LiveKit token' })
  }
}

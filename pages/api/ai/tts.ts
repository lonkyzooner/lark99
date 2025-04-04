import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { PassThrough } from 'stream'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text, voice = 'ash' } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Generate speech using OpenAI TTS API
    const mp3 = await openai.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'tts-1',
      voice: process.env.OPENAI_TTS_VOICE || voice,
      input: text,
    })

    // Convert to buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // Set appropriate headers
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', buffer.length)
    
    // Send the audio data
    res.send(buffer)
  } catch (error: any) {
    console.error('Error generating speech:', error)
    return res.status(500).json({ error: error.message || 'Error generating speech' })
  }
}

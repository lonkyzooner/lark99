import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import formidable from 'formidable'
import fs from 'fs'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configure Next.js to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Parse the multipart form data
    const form = formidable({ multiples: false })
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    // Get the audio file
    const audioFile = files.audio as formidable.File
    
    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' })
    }

    // Read the file
    const fileBuffer = fs.readFileSync(audioFile.filepath)

    // Process the audio with OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.filepath),
      model: 'whisper-1',
      language: 'en',
    })

    // Clean up the temporary file
    fs.unlinkSync(audioFile.filepath)

    return res.status(200).json({
      text: transcription.text,
    })
  } catch (error: any) {
    console.error('Error processing voice command:', error)
    return res.status(500).json({ error: error.message || 'Error processing voice command' })
  }
}

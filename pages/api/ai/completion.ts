import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { Groq } from 'groq-sdk'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt, context, useGroq = false } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    // Construct the system message with context
    const systemMessage = `You are LARK, a Law Enforcement Assistant and Resource Kit. 
    You provide assistance to law enforcement officers in the field.
    ${context ? `Current context: ${JSON.stringify(context)}` : ''}`

    let response

    if (useGroq) {
      // Use Groq for completion
      response = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        model: process.env.GROQ_API_MODEL || 'llama3-70b-8192',
        temperature: 0.7,
        max_tokens: 1024,
      })

      return res.status(200).json({
        text: response.choices[0]?.message?.content || 'No response generated',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        }
      })
    } else {
      // Use OpenAI for completion
      response = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        model: process.env.OPENAI_API_MODEL || 'gpt-4-turbo',
        temperature: 0.7,
        max_tokens: 1024,
      })

      return res.status(200).json({
        text: response.choices[0]?.message?.content || 'No response generated',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        }
      })
    }
  } catch (error: any) {
    console.error('Error generating AI completion:', error)
    return res.status(500).json({ error: error.message || 'Error generating AI completion' })
  }
}

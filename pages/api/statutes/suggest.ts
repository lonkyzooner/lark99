import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { description } = req.body

    if (!description) {
      return res.status(400).json({ error: 'Incident description is required' })
    }

    // Construct the system message with specific instructions for statute suggestions
    const systemMessage = `You are LARK, a Law Enforcement Assistant and Resource Kit, analyzing an incident description to suggest applicable criminal statutes.
    
    Your task is to identify potential criminal violations in Louisiana based on the incident description provided.
    
    For each potential violation:
    1. Provide the Louisiana Revised Statute (La. R.S.) number
    2. Provide the title of the statute
    3. Explain why this statute might apply to the described incident
    4. Note any elements that might be missing from the description that would be needed to fully establish this violation
    
    Format your response as a JSON array of statute suggestions, each with:
    - id: The statute number (e.g., "14:67")
    - title: The name of the offense
    - explanation: A brief explanation of why this statute applies
    - elements: Key elements needed to establish this violation
    
    Focus on Louisiana criminal statutes only. Be specific and accurate with statute numbers.`

    // Use OpenAI for statute suggestion
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: `Based on this incident description, suggest applicable Louisiana criminal statutes:\n\n${description}` }
      ],
      model: process.env.OPENAI_API_MODEL || 'gpt-4-turbo',
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    // Parse the response
    const suggestionsText = response.choices[0]?.message?.content || '{"suggestions": []}'
    let suggestions
    
    try {
      suggestions = JSON.parse(suggestionsText)
    } catch (e) {
      console.error('Error parsing suggestions JSON:', e)
      suggestions = { suggestions: [] }
    }

    return res.status(200).json(suggestions)
  } catch (error: any) {
    console.error('Error suggesting statutes:', error)
    return res.status(500).json({ error: error.message || 'Error suggesting statutes' })
  }
}

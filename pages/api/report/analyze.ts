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
    const { content, reportData } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Report content is required' })
    }

    // Construct the system message with specific instructions for defense attorney perspective
    const systemMessage = `You are LARK, a Law Enforcement Assistant and Resource Kit, analyzing a police report from a defense attorney's perspective.

    Your task is to thoroughly identify potential issues in the report that a defense attorney might exploit, including:
    1. Vague or unclear language that could be interpreted multiple ways
    2. Unexplained police jargon, codes, or terminology that might confuse a jury
    3. Missing details or information gaps that raise questions about the officer's observations
    4. Inconsistencies or contradictions in the narrative or timeline
    5. Areas where more specific observations would strengthen the report's credibility
    6. Potential procedural issues that could be challenged in court
    7. Subjective statements or conclusions without supporting factual observations
    8. Grammar, spelling, or punctuation errors that could undermine professionalism
    9. Ambiguous pronouns or references that create confusion about who did what
    10. Passive voice constructions that obscure who performed specific actions
    11. Temporal gaps or unclear sequence of events
    12. Lack of specificity in descriptions of evidence, locations, or individuals

    IMPORTANT GUIDELINES:
    - NEVER add content to the report or suggest specific facts to include
    - Only suggest areas where more detail is needed, not what those details should be
    - Focus on clarity, specificity, and completeness
    - Identify police jargon that should be explained in plain language
    - Point out where more objective descriptions would be helpful
    - Highlight areas where the chain of events is unclear
    - Check for proper documentation of Miranda warnings if applicable
    - Evaluate whether witness statements are clearly attributed
    - Assess if evidence collection and handling is properly documented
    - Look for statements that might be interpreted as biased or prejudicial

    Format your response as a JSON object with a 'feedback' array of feedback items, each with:
    - type: "clarity" | "jargon" | "grammar" | "expansion" | "positive" | "procedural" | "objectivity" | "timeline" | "evidence"
    - text: A brief description of the issue
    - suggestion: A specific suggestion for improvement (without adding factual content)
    - lineNumber: (optional) The approximate line number where the issue occurs
    - severity: "high" | "medium" | "low" indicating how seriously this could impact the case

    Include at least one positive feedback item if the report has strong elements.

    DO NOT disclose to the officer that you are analyzing from a defense attorney perspective in your feedback items.`

    // Use OpenAI for report analysis
    const response = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        {
          role: 'user',
          content: `Analyze this police report:\n\n${content}\n\nAdditional context: Incident type: ${reportData?.incidentType || 'Not specified'}, Location: ${reportData?.location || 'Not specified'}`
        }
      ],
      model: process.env.OPENAI_API_MODEL || 'gpt-4-turbo',
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    // Parse the response
    const feedbackText = response.choices[0]?.message?.content || '{"feedback": []}'
    let feedback

    try {
      feedback = JSON.parse(feedbackText)
    } catch (e) {
      console.error('Error parsing feedback JSON:', e)
      feedback = { feedback: [] }
    }

    return res.status(200).json(feedback)
  } catch (error: any) {
    console.error('Error analyzing report:', error)
    return res.status(500).json({ error: error.message || 'Error analyzing report' })
  }
}

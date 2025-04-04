"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Lightbulb, ArrowRight } from "lucide-react"
import { APIService } from "@/lib/api-service"

interface StatutesViewProps {
  isOffline: boolean
  cachedData: any
}

export function StatutesView({ isOffline, cachedData }: StatutesViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedStatute, setSelectedStatute] = useState<any>(null)
  const [incidentDescription, setIncidentDescription] = useState("")
  const [suggestedCrimes, setSuggestedCrimes] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const apiServiceRef = useRef<APIService>(APIService.getInstance())

  // This would come from Firebase in a real implementation
  const sampleStatutes = [
    {
      id: "14:67",
      title: "Theft",
      description:
        "Theft is the misappropriation or taking of anything of value which belongs to another, either without the consent of the other to the misappropriation or taking, or by means of fraudulent conduct, practices, or representations. An intent to deprive the other permanently of whatever may be the subject of the misappropriation or taking is essential.",
      penalties:
        "Penalties depend on the value of the stolen items and range from a fine of not more than $1,000 or imprisonment for not more than six months, or both, to imprisonment at hard labor for not more than twenty years.",
    },
    {
      id: "14:98",
      title: "Operating a vehicle while intoxicated",
      description:
        "The crime of operating a vehicle while intoxicated is the operating of any motor vehicle, aircraft, watercraft, vessel, or other means of conveyance when the operator is under the influence of alcoholic beverages, or the operator's blood alcohol concentration is 0.08 percent or more by weight, or the operator is under the influence of any controlled dangerous substance.",
      penalties:
        "First offense: Fine of not less than $300 nor more than $1,000, and imprisonment for not less than 10 days nor more than 6 months. Subsequent offenses carry increased penalties.",
    },
  ]

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    // In a real implementation, this would search Firebase data
    const results = sampleStatutes.filter(
      (statute) =>
        statute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        statute.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setSearchResults(results)
    setSelectedStatute(null)
  }

  const handleSelectStatute = (statute: any) => {
    setSelectedStatute(statute)
  }

  const analyzeCrimeDescription = async () => {
    if (!incidentDescription.trim()) return

    setIsAnalyzing(true)
    setSuggestedCrimes([])

    try {
      // Call the API to analyze the description and suggest applicable statutes
      const response = await fetch(`/api/statutes/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: incidentDescription,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      // Process the suggestions
      const parsedStatutes = (data.suggestions || []).map((suggestion: any) => {
        return {
          id: suggestion.id || 'Unknown',
          title: suggestion.title || 'Unknown Statute',
          explanation: suggestion.explanation || '',
          elements: suggestion.elements || [],
          // Find if this matches any of our sample statutes
          details: sampleStatutes.find(s => s.id.includes(suggestion.id))
        }
      })

      setSuggestedCrimes(parsedStatutes)
    } catch (error) {
      console.error('Error analyzing crime description:', error)

      // Fallback to using the completion API if the dedicated endpoint fails
      try {
        const response = await apiServiceRef.current.generateCompletion(
          `Based on the following incident description, suggest the most applicable Louisiana criminal statutes that might apply. For each statute, provide the statute number, title, and a brief explanation of why it applies:\n\n${incidentDescription}`,
          { role: "statute_advisor" },
          false
        )

        // Simple parsing of the response to extract statutes
        const text = response.text
        const statutes = text.split('\n\n').filter(s => s.includes('R.S.') || s.includes('La.') || s.includes(':'))

        const parsedStatutes = statutes.map(statute => {
          // Try to extract statute number, title and explanation
          const idMatch = statute.match(/(?:La\. R\.S\.|R\.S\.) (\d+:\d+)/i)
          const titleMatch = statute.match(/- ([^\n]+)/)

          return {
            id: idMatch ? idMatch[1] : 'Unknown',
            title: titleMatch ? titleMatch[1].trim() : 'Unknown Statute',
            explanation: statute,
            // Find if this matches any of our sample statutes
            details: sampleStatutes.find(s => idMatch && s.id.includes(idMatch[1]))
          }
        })

        setSuggestedCrimes(parsedStatutes)
      } catch (fallbackError) {
        console.error('Fallback error analyzing crime description:', fallbackError)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Crime Finder</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Describe the incident</h3>
              <Textarea
                placeholder="Describe what happened in detail. LARK will suggest applicable criminal statutes..."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                className="min-h-[120px]"
              />
              <Button
                onClick={analyzeCrimeDescription}
                className="mt-2 w-full"
                disabled={isAnalyzing || !incidentDescription.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Suggest Applicable Crimes
                  </>
                )}
              </Button>
            </div>

            {suggestedCrimes.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-blue-600" />
                  Suggested Applicable Statutes
                </h3>
                <div className="space-y-3">
                  {suggestedCrimes.map((crime, index) => (
                    <div key={index} className="p-2 bg-white rounded border border-blue-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">La. R.S. {crime.id} - {crime.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{crime.explanation}</p>

                          {crime.elements && crime.elements.length > 0 && (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <h5 className="text-xs font-medium text-gray-700">Required Elements:</h5>
                              <ul className="text-xs text-gray-600 list-disc pl-4 mt-1">
                                {typeof crime.elements === 'string' ? (
                                  <li>{crime.elements}</li>
                                ) : (
                                  Array.isArray(crime.elements) && crime.elements.map((element, i) => (
                                    <li key={i}>{element}</li>
                                  ))
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        {crime.details && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2 flex-shrink-0"
                            onClick={() => handleSelectStatute(crime.details)}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-2">Or search directly by statute</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Search by statute number (e.g., 14:67) or keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {searchResults.length > 0 && !selectedStatute && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Search Results:</h3>
              <ul className="space-y-2">
                {searchResults.map((statute) => (
                  <li key={statute.id}>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left"
                      onClick={() => handleSelectStatute(statute)}
                    >
                      <span className="font-medium">La. R.S. {statute.id}</span>
                      <span className="mx-2">-</span>
                      <span>{statute.title}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedStatute && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">
                La. R.S. {selectedStatute.id} - {selectedStatute.title}
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Description:</h4>
                  <p>{selectedStatute.description}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Penalties:</h4>
                  <p>{selectedStatute.penalties}</p>
                </div>
              </div>
              <Button variant="outline" className="mt-4" onClick={() => setSelectedStatute(null)}>
                Back to Results
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500 mt-2">
        {isOffline ? (
          <p>You are currently offline. Using cached statute data.</p>
        ) : (
          <p>Connected to server. Latest statute data available.</p>
        )}
      </div>
    </div>
  )
}


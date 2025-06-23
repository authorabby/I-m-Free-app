"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Share2, Copy } from "lucide-react"
import { AvailabilitySelector } from "@/components/availability-selector"
import { HeatMap } from "@/components/heat-map"

interface Participant {
  name: string
  availability: Record<string, boolean>
}

interface EventData {
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  creator: string
  participants: Participant[]
}

export default function EventPage() {
  const params = useParams()
  const eventId = params.id as string
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [isJoining, setIsJoining] = useState(false)
  const [shareUrl, setShareUrl] = useState("")

  useEffect(() => {
    // Load event data from localStorage
    const storedData = localStorage.getItem(`event_${eventId}`)
    if (storedData) {
      setEventData(JSON.parse(storedData))
    }

    // Set share URL
    setShareUrl(window.location.href)
  }, [eventId])

  const handleJoinEvent = () => {
    if (!participantName.trim()) {
      alert("Please enter your name")
      return
    }

    if (!eventData) return

    const updatedEventData = {
      ...eventData,
      participants: [
        ...eventData.participants,
        {
          name: participantName,
          availability,
        },
      ],
    }

    localStorage.setItem(`event_${eventId}`, JSON.stringify(updatedEventData))
    setEventData(updatedEventData)
    setIsJoining(false)
    setParticipantName("")
    setAvailability({})
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    alert("Link copied to clipboard!")
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Event not found</h2>
            <p className="text-gray-600">This event may have been deleted or the link is invalid.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">I'm Free</h1>
          <p className="text-lg text-gray-600">Find the perfect time when everyone's available</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {eventData.title}
            </CardTitle>
            <CardDescription>
              Created by {eventData.creator} • {eventData.startDate} to {eventData.endDate} • {eventData.startTime} -{" "}
              {eventData.endTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="text-sm text-gray-600">
                  {eventData.participants.length} participant{eventData.participants.length !== 1 ? "s" : ""}
                </span>
                <div className="flex gap-1 ml-2">
                  {eventData.participants.map((participant, index) => (
                    <Badge key={index} variant="secondary">
                      {participant.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={copyShareUrl}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
                <Copy className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {eventData.participants.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability Heat Map
              </CardTitle>
              <CardDescription>Darker colors indicate more people are available at that time</CardDescription>
            </CardHeader>
            <CardContent>
              <HeatMap
                startDate={eventData.startDate}
                endDate={eventData.endDate}
                startTime={eventData.startTime}
                endTime={eventData.endTime}
                participants={eventData.participants}
              />
            </CardContent>
          </Card>
        )}

        {!isJoining ? (
          <div className="text-center">
            <Button onClick={() => setIsJoining(true)} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Users className="w-4 h-4 mr-2" />
              Add Your Availability
            </Button>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Add Your Availability</CardTitle>
              <CardDescription>Select the times when you're available</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="participantName">Your Name</Label>
                <Input
                  id="participantName"
                  placeholder="Enter your name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
              </div>

              <AvailabilitySelector
                startDate={eventData.startDate}
                endDate={eventData.endDate}
                startTime={eventData.startTime}
                endTime={eventData.endTime}
                availability={availability}
                onAvailabilityChange={setAvailability}
              />

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsJoining(false)}>
                  Cancel
                </Button>
                <Button onClick={handleJoinEvent}>Add My Availability</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

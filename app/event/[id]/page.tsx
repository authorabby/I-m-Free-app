"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Share2, Copy, Sparkles, ArrowLeft } from "lucide-react"
import { AvailabilitySelector } from "@/components/availability-selector"
import { HeatMap } from "@/components/heat-map"
import Link from "next/link"

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
  coverImage: string
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
    alert("Link copied to clipboard! 🎉")
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Event not found</h2>
            <p className="text-gray-600 mb-6">This event may have been deleted or the link is invalid.</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              I'm Free
            </h1>
          </div>
        </div>

        {/* Event Header Card */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          {/* Cover Image */}
          {eventData.coverImage ? (
            <div
              className="h-48 bg-cover bg-center relative"
              style={{ backgroundImage: `url(${eventData.coverImage})` }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{eventData.title}</h2>
              </div>
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500 relative">
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{eventData.title}</h2>
              </div>
            </div>
          )}

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date Range</p>
                  <p className="font-semibold text-gray-900">
                    {eventData.startDate} to {eventData.endDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Time Range</p>
                  <p className="font-semibold text-gray-900">
                    {eventData.startTime} - {eventData.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Participants</p>
                  <p className="font-semibold text-gray-900">
                    {eventData.participants.length} participant{eventData.participants.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Created by</span>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-0">
                  {eventData.creator}
                </Badge>
                <div className="flex gap-1 ml-2">
                  {eventData.participants.slice(1).map((participant, index) => (
                    <Badge key={index} variant="outline" className="border-gray-200 text-gray-600">
                      {participant.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareUrl}
                className="border-violet-200 text-violet-600 hover:bg-violet-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Link
                <Copy className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Heat Map */}
        {eventData.participants.length > 0 && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-5 h-5" />
                Availability Heat Map
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Discover when everyone is free - darker colors mean more people are available
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
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

        {/* Join Event Section */}
        {!isJoining ? (
          <div className="text-center">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-violet-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Add Your Availability</h3>
                <p className="text-gray-600 mb-6">Help find the perfect time by sharing when you're free</p>
                <Button
                  onClick={() => setIsJoining(true)}
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg px-8"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join This Event
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Add Your Availability</CardTitle>
              <CardDescription className="text-violet-100">
                Select the times when you're available using click and drag
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="participantName" className="text-sm font-semibold text-gray-700">
                  Your Name
                </Label>
                <Input
                  id="participantName"
                  placeholder="Enter your name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Your Availability</Label>
                <div className="bg-gray-50 rounded-xl p-4">
                  <AvailabilitySelector
                    startDate={eventData.startDate}
                    endDate={eventData.endDate}
                    startTime={eventData.startTime}
                    endTime={eventData.endTime}
                    availability={availability}
                    onAvailabilityChange={setAvailability}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsJoining(false)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleJoinEvent}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg flex-1"
                >
                  Add My Availability
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

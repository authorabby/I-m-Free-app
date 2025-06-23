"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, Users } from "lucide-react"
import { AvailabilitySelector } from "@/components/availability-selector"

export default function HomePage() {
  const router = useRouter()
  const [eventTitle, setEventTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [creatorName, setCreatorName] = useState("")
  const [availability, setAvailability] = useState<Record<string, boolean>>({})

  const handleCreateEvent = () => {
    if (!eventTitle || !startDate || !endDate || !creatorName) {
      alert("Please fill in all required fields")
      return
    }

    const eventData = {
      title: eventTitle,
      startDate,
      endDate,
      startTime,
      endTime,
      creator: creatorName,
      participants: [
        {
          name: creatorName,
          availability,
        },
      ],
    }

    // Generate a simple ID (in a real app, this would be more robust)
    const eventId = Math.random().toString(36).substring(2, 15)

    // Store in localStorage (in a real app, this would be a database)
    localStorage.setItem(`event_${eventId}`, JSON.stringify(eventData))

    router.push(`/event/${eventId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">I'm Free</h1>
          <p className="text-lg text-gray-600">Find the perfect time when everyone's available</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Create New Event
            </CardTitle>
            <CardDescription>Set up a new scheduling event and share it with others</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Event Title *</Label>
                <Input
                  id="eventTitle"
                  placeholder="Team Meeting, Coffee Chat, etc."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creatorName">Your Name *</Label>
                <Input
                  id="creatorName"
                  placeholder="Enter your name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {startDate && endDate && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Your Availability
              </CardTitle>
              <CardDescription>Select the times when you're available during the specified period</CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilitySelector
                startDate={startDate}
                endDate={endDate}
                startTime={startTime}
                endTime={endTime}
                availability={availability}
                onAvailabilityChange={setAvailability}
              />
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button onClick={handleCreateEvent} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            <Users className="w-4 h-4 mr-2" />
            Create Event & Get Shareable Link
          </Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Plus, Sparkles, Crown, UserCheck } from "lucide-react"
import { AvailabilitySelector } from "@/components/availability-selector"
import { CoverImageSelector } from "@/components/cover-image-selector"

interface EventData {
  id: string
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  creator: string
  coverImage: string
  participants: Array<{
    name: string
    availability: Record<string, boolean>
  }>
  createdAt: string
}

interface UserEventData {
  eventId: string
  role: "creator" | "participant"
  participantName?: string
}

export default function HomePage() {
  const router = useRouter()
  const [eventTitle, setEventTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("17:00")
  const [creatorName, setCreatorName] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [existingEvents, setExistingEvents] = useState<EventData[]>([])
  const [userEvents, setUserEvents] = useState<UserEventData[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    // Load user's events from localStorage
    const userEventsData = localStorage.getItem("userEvents")
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    setUserEvents(userEventsList)

    // Load existing events from localStorage
    const events: EventData[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("event_")) {
        try {
          const eventData = JSON.parse(localStorage.getItem(key) || "{}")
          const eventId = key.replace("event_", "")
          events.push({ ...eventData, id: eventId })
        } catch (e) {
          console.error("Error parsing event data:", e)
        }
      }
    }

    // Filter events to only show ones the user is involved in
    const userEventIds = userEventsList.map((ue) => ue.eventId)
    const filteredEvents = events.filter((event) => userEventIds.includes(event.id))

    // Sort by creation date (newest first)
    filteredEvents.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    setExistingEvents(filteredEvents)
  }, [])

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
      coverImage,
      participants: [
        {
          name: creatorName,
          availability,
        },
      ],
      createdAt: new Date().toISOString(),
    }

    // Generate a simple ID (in a real app, this would be more robust)
    const eventId = Math.random().toString(36).substring(2, 15)

    // Store in localStorage (in a real app, this would be a database)
    localStorage.setItem(`event_${eventId}`, JSON.stringify(eventData))

    // Update user events
    const userEventsData = localStorage.getItem("userEvents")
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    userEventsList.push({
      eventId,
      role: "creator",
      participantName: creatorName,
    })
    localStorage.setItem("userEvents", JSON.stringify(userEventsList))

    router.push(`/event/${eventId}`)
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    }

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`
  }

  const getEventStatus = (event: EventData) => {
    const now = new Date()
    const endDate = new Date(event.endDate)

    if (endDate < now) {
      return { label: "Completed", color: "bg-gray-100 text-gray-600" }
    }

    if (event.participants.length === 1) {
      return { label: "Waiting for responses", color: "bg-amber-100 text-amber-700" }
    }

    return { label: "Active", color: "bg-emerald-100 text-emerald-700" }
  }

  const getUserRole = (eventId: string) => {
    const userEvent = userEvents.find((ue) => ue.eventId === eventId)
    return userEvent?.role || "participant"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              I'm Free
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">Find the perfect time when everyone's available</p>
        </div>

        {/* Events Dashboard */}
        {existingEvents.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {existingEvents.map((event) => {
                const status = getEventStatus(event)
                const userRole = getUserRole(event.id)
                const isCreator = userRole === "creator"

                return (
                  <Card
                    key={event.id}
                    className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02] bg-white/80 backdrop-blur-sm ${
                      isCreator ? "ring-2 ring-violet-200" : ""
                    }`}
                    onClick={() => router.push(`/event/${event.id}`)}
                  >
                    <div className="relative">
                      {event.coverImage ? (
                        <div
                          className="h-32 bg-cover bg-center rounded-t-lg"
                          style={{ backgroundImage: `url(${event.coverImage})` }}
                        />
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500 rounded-t-lg flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-white/80" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {isCreator && (
                          <Badge className="bg-violet-500 text-white border-0 font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Creator
                          </Badge>
                        )}
                        {!isCreator && (
                          <Badge className="bg-blue-500 text-white border-0 font-medium flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Participant
                          </Badge>
                        )}
                        <Badge className={`${status.color} border-0 font-medium`}>{status.label}</Badge>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                        {event.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-violet-500" />
                          <span>{formatDateRange(event.startDate, event.endDate)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-pink-500" />
                          <span>
                            {event.participants.length} participant{event.participants.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          {isCreator ? "Created by you" : `Created by ${event.creator}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Create New Event Button (when no events exist) */}
        {existingEvents.length === 0 && !showCreateForm && (
          <div className="text-center mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-violet-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Create your first event</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start by creating a scheduling event and invite others to share their availability
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg px-8 py-3 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        )}

        {/* Create Event Form */}
        {showCreateForm && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5" />
                Create New Event
              </CardTitle>
              <CardDescription className="text-violet-100">
                Set up a new scheduling event and share it with others
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Cover Image Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Cover Image</Label>
                <CoverImageSelector value={coverImage} onChange={setCoverImage} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="eventTitle" className="text-sm font-semibold text-gray-700">
                    Event Title *
                  </Label>
                  <Input
                    id="eventTitle"
                    placeholder="Team Meeting, Coffee Chat, etc."
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creatorName" className="text-sm font-semibold text-gray-700">
                    Your Name *
                  </Label>
                  <Input
                    id="creatorName"
                    placeholder="Enter your name"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-semibold text-gray-700">
                    Start Time
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-semibold text-gray-700">
                    End Time
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700">Your Availability</Label>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <AvailabilitySelector
                      startDate={startDate}
                      endDate={endDate}
                      startTime={startTime}
                      endTime={endTime}
                      availability={availability}
                      onAvailabilityChange={setAvailability}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg flex-1"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Create Event & Get Shareable Link
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

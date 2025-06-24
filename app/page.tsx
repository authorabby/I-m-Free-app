"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Crown,
  UserCheck,
  LogOut,
  User,
  Lock,
  CalendarCheck,
  Moon,
  Sun,
  Archive,
} from "lucide-react"
import { AvailabilitySelector } from "@/components/availability-selector"
import { CoverImageSelector } from "@/components/cover-image-selector"
import { useTheme } from "@/components/theme-provider"

// This defines what information we store about each meeting
interface Meeting {
  date: string
  time: string
  confirmedAt: string
}

// This defines what information we store about archived events
interface ArchivedEvent {
  id: string
  title: string
  participants: string[]
  confirmedMeeting?: {
    date: string
    time: string
  }
  timeRange: string
  completedAt: string
}

// This defines what information we store about each event
interface EventData {
  id: string
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  creator: string
  coverImage: string
  coverImageAttribution?: string
  participants: Array<{
    name: string
    email?: string
    availability: Record<string, boolean>
  }>
  meetings?: Meeting[] // List of confirmed meetings
  createdAt: string
}

// This defines the connection between users and events
interface UserEventData {
  eventId: string
  role: "creator" | "participant"
  participantName?: string
}

// This defines what information we store about the current user
interface CurrentUser {
  username: string
  name: string
  email?: string
}

// This is the main home page component
// It shows all events and lets users create new ones
export default function HomePage() {
  const router = useRouter() // This helps us move between pages
  const { theme, setTheme } = useTheme()

  // These variables store the current state of the page
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [eventTitle, setEventTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("9:00 AM")
  const [endTime, setEndTime] = useState("5:00 PM")
  const [coverImage, setCoverImage] = useState("")
  const [coverImageAttribution, setCoverImageAttribution] = useState("")
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [existingEvents, setExistingEvents] = useState<EventData[]>([])
  const [userEvents, setUserEvents] = useState<UserEventData[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showArchivedEvents, setShowArchivedEvents] = useState(false)
  const [archivedEvents, setArchivedEvents] = useState<ArchivedEvent[]>([])

  // List of demo account usernames (these accounts can't create or edit)
  const demoAccounts = ["alice", "bob", "carol", "david"]

  // Check if the current user is a demo account
  const isDemoAccount = currentUser ? demoAccounts.includes(currentUser.username) : false

  // This function creates demo archived events for demo users
  const createDemoArchivedEvents = (username: string): ArchivedEvent[] => {
    const demoArchived: ArchivedEvent[] = [
      {
        id: "archived_1",
        title: "Q4 Planning Meeting",
        participants: ["Alice Johnson", "Bob Smith", "Carol Davis"],
        confirmedMeeting: {
          date: "2024-11-15",
          time: "14:00",
        },
        timeRange: "9:00 AM - 5:00 PM",
        completedAt: "2024-11-15T14:00:00Z",
      },
      {
        id: "archived_2",
        title: "Team Retrospective",
        participants: ["Bob Smith", "David Wilson", "Alice Johnson"],
        confirmedMeeting: {
          date: "2024-10-28",
          time: "10:30",
        },
        timeRange: "9:00 AM - 6:00 PM",
        completedAt: "2024-10-28T10:30:00Z",
      },
      {
        id: "archived_3",
        title: "Client Presentation",
        participants: ["Carol Davis", "Alice Johnson"],
        confirmedMeeting: {
          date: "2024-12-05",
          time: "15:00",
        },
        timeRange: "1:00 PM - 6:00 PM",
        completedAt: "2024-12-05T15:00:00Z",
      },
    ]

    // Filter archived events based on user
    return demoArchived.filter((event) =>
      event.participants.some(
        (name) =>
          name.toLowerCase().includes(username) ||
          (username === "alice" && name.includes("Alice")) ||
          (username === "bob" && name.includes("Bob")) ||
          (username === "carol" && name.includes("Carol")) ||
          (username === "david" && name.includes("David")),
      ),
    )
  }

  // This function randomly selects meetings for completed demo events
  const addMeetingsToCompletedEvents = (events: EventData[]): EventData[] => {
    return events.map((event) => {
      const status = getEventStatus(event)

      // Only add meetings to completed events that don't already have them
      if (status.label === "Completed" && (!event.meetings || event.meetings.length === 0)) {
        // Find time slots where all participants are available
        const availableSlots: Array<{ date: string; time: string }> = []

        // Get all dates in the event range
        const start = new Date(event.startDate)
        const end = new Date(event.endDate)
        const dates: string[] = []

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d).toISOString().split("T")[0])
        }

        // Get all time slots
        const startHour = Number.parseInt(event.startTime.split(":")[0])
        const startMinute = Number.parseInt(event.startTime.split(":")[1])
        const endHour = Number.parseInt(event.endTime.split(":")[0])
        const endMinute = Number.parseInt(event.endTime.split(":")[1])

        const timeSlots: string[] = []
        let currentHour = startHour
        let currentMinute = startMinute

        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
          const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`
          timeSlots.push(timeString)

          currentMinute += 30
          if (currentMinute >= 60) {
            currentMinute = 0
            currentHour++
          }
        }

        // Find slots where everyone is available
        dates.forEach((date) => {
          timeSlots.forEach((time) => {
            const key = `${date}_${time}`
            const availableCount = event.participants.filter((p) => p.availability[key]).length
            if (availableCount === event.participants.length) {
              availableSlots.push({ date, time })
            }
          })
        })

        // Randomly select 1-2 meetings from available slots
        if (availableSlots.length > 0) {
          const numMeetings = Math.min(Math.floor(Math.random() * 2) + 1, availableSlots.length)
          const selectedSlots = availableSlots.sort(() => Math.random() - 0.5).slice(0, numMeetings)

          const meetings: Meeting[] = selectedSlots.map((slot) => ({
            date: slot.date,
            time: slot.time,
            confirmedAt: new Date(event.createdAt).toISOString(),
          }))

          return { ...event, meetings }
        }
      }

      return event
    })
  }

  // This runs when the page first loads
  useEffect(() => {
    // Check if someone is logged in
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login") // Send them to login page if not logged in
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Load the user's events from storage
    const userEventsData = localStorage.getItem(`userEvents_${user.username}`)
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    setUserEvents(userEventsList)

    // Load all events from storage
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

    // Only show events the user is involved in
    const userEventIds = userEventsList.map((ue) => ue.eventId)
    let filteredEvents = events.filter((event) => userEventIds.includes(event.id))

    // Add meetings to completed demo events
    if (isDemoAccount || demoAccounts.includes(user.username)) {
      filteredEvents = addMeetingsToCompletedEvents(filteredEvents)
    }

    // Auto-archive completed events older than 1 month
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const activeEvents = filteredEvents.filter((event) => {
      const status = getEventStatus(event)
      const eventEndDate = new Date(event.endDate)

      // Keep event if it's not completed or if it's completed but less than 1 month old
      return status.label !== "Completed" || eventEndDate > oneMonthAgo
    })

    // Sort events by creation date (newest first)
    activeEvents.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    setExistingEvents(activeEvents)

    // Load archived events for demo users
    if (isDemoAccount || demoAccounts.includes(user.username)) {
      const demoArchived = createDemoArchivedEvents(user.username)
      setArchivedEvents(demoArchived)
    }
  }, [router, isDemoAccount])

  // This function logs the user out
  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  // This function converts 12-hour time (like "2:00 PM") to 24-hour time (like "14:00")
  const convertTo24Hour = (time12h: string) => {
    const [time, modifier] = time12h.split(" ")
    let [hours, minutes] = time.split(":")
    if (hours === "12") {
      hours = "00"
    }
    if (modifier === "PM") {
      hours = String(Number.parseInt(hours, 10) + 12)
    }
    return `${hours}:${minutes}`
  }

  // This function handles when someone selects a cover image
  const handleCoverImageChange = (imageUrl: string, attribution?: string) => {
    setCoverImage(imageUrl)
    setCoverImageAttribution(attribution || "")
  }

  // This function creates a new event
  const handleCreateEvent = () => {
    // Make sure all required fields are filled out
    if (!eventTitle || !startDate || !endDate || !currentUser) {
      alert("Please fill in all required fields")
      return
    }

    // Create the event data
    const eventData = {
      title: eventTitle,
      startDate,
      endDate,
      startTime: convertTo24Hour(startTime),
      endTime: convertTo24Hour(endTime),
      creator: currentUser.name,
      coverImage,
      coverImageAttribution,
      participants: [
        {
          name: currentUser.name,
          email: currentUser.email,
          availability,
        },
      ],
      meetings: [], // Start with no confirmed meetings
      createdAt: new Date().toISOString(),
    }

    // Create a unique ID for the event
    const eventId = Math.random().toString(36).substring(2, 15)

    // Save the event to storage
    localStorage.setItem(`event_${eventId}`, JSON.stringify(eventData))

    // Connect the user to this event
    const userEventsData = localStorage.getItem(`userEvents_${currentUser.username}`)
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    userEventsList.push({
      eventId,
      role: "creator",
      participantName: currentUser.name,
    })
    localStorage.setItem(`userEvents_${currentUser.username}`, JSON.stringify(userEventsList))

    // Go to the event page
    router.push(`/event/${eventId}`)
  }

  // This function formats date ranges to look nice
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const formatDateOnly = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    }

    if (start.toDateString() === end.toDateString()) {
      return formatDateOnly(start)
    }

    const startMonth = start.getMonth()
    const endMonth = end.getMonth()
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    if (startYear === endYear) {
      if (startMonth === endMonth) {
        // Same month and year
        return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} to ${end.getDate()}, ${startYear}`
      } else {
        // Different months, same year
        return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} to ${end.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${startYear}`
      }
    } else {
      // Different years
      return `${formatDateOnly(start)} to ${formatDateOnly(end)}`
    }
  }

  // This function formats times to look nice (converts 24-hour to 12-hour)
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // This function formats meeting information for display
  const formatMeetingInfo = (meetings: Meeting[] = []) => {
    if (meetings.length === 0) {
      return "TBD"
    }

    if (meetings.length === 1) {
      const meeting = meetings[0]
      const date = new Date(meeting.date)
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
      return `${formattedDate} at ${formatTime(meeting.time)}`
    }

    return `${meetings.length} meetings scheduled`
  }

  // This function determines what status badge to show for each event
  const getEventStatus = (event: EventData) => {
    const now = new Date()
    const endDate = new Date(event.endDate)

    if (endDate < now) {
      return { label: "Completed", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" }
    }

    // Check if meetings are set
    if (event.meetings && event.meetings.length > 0) {
      return {
        label: "Meeting Set",
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      }
    }

    if (event.participants.length === 1) {
      return {
        label: "Waiting for responses",
        color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      }
    }

    return { label: "Active", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" }
  }

  // This function determines if the user created or joined an event
  const getUserRole = (eventId: string) => {
    const userEvent = userEvents.find((ue) => ue.eventId === eventId)
    return userEvent?.role || "participant"
  }

  // Show loading message while we check if user is logged in
  if (!currentUser) {
    return <div>Loading...</div>
  }

  // This is what shows up on the screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header section with app title and user info */}
        <div className="flex items-center justify-between mb-12">
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 dark:from-orange-500 dark:to-pink-500 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-orange-400 dark:to-pink-400 bg-clip-text text-transparent">
                I'm Free
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 font-medium">
              Find the perfect time when everyone's available
            </p>
          </div>

          {/* User info, theme toggle, and logout button */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20 dark:border-gray-700/20">
              <User className="w-4 h-4 text-violet-600 dark:text-orange-400" />
              <span className="font-medium text-gray-700 dark:text-gray-200">{currentUser.name}</span>
              {isDemoAccount && (
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-0 text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Demo
                </Badge>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Events Dashboard - shows all the user's events */}
        {existingEvents.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Events</h2>
              {/* Only show "New Event" button for non-demo accounts */}
              {!isDemoAccount && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 dark:from-orange-500 dark:to-pink-500 hover:from-violet-600 hover:to-purple-700 dark:hover:from-orange-600 dark:hover:to-pink-600 text-white shadow-lg"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              )}
              {/* Show locked message for demo accounts */}
              {isDemoAccount && (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Demo Mode - Creation Disabled</span>
                </div>
              )}
            </div>

            {/* Grid of event cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {existingEvents.map((event) => {
                const status = getEventStatus(event)
                const userRole = getUserRole(event.id)
                const isCreator = userRole === "creator"

                return (
                  <Card
                    key={event.id}
                    className={`group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md hover:scale-[1.02] bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm ${
                      isCreator ? "ring-2 ring-violet-200 dark:ring-orange-400/50" : ""
                    }`}
                    onClick={() => router.push(`/event/${event.id}`)}
                  >
                    {/* Event cover image */}
                    <div className="relative">
                      {event.coverImage ? (
                        <div
                          className="h-32 bg-cover bg-center rounded-t-lg"
                          style={{ backgroundImage: `url(${event.coverImage})` }}
                        />
                      ) : (
                        <div className="h-32 bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500 dark:from-orange-400 dark:via-pink-500 dark:to-purple-500 rounded-t-lg flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-white/80" />
                        </div>
                      )}
                      {/* Badges showing user role and event status */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {isCreator && (
                          <Badge className="bg-violet-500 dark:bg-orange-500 text-white border-0 font-medium flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Creator
                          </Badge>
                        )}
                        {!isCreator && (
                          <Badge className="bg-blue-500 dark:bg-blue-600 text-white border-0 font-medium flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Participant
                          </Badge>
                        )}
                        <Badge className={`${status.color} border-0 font-medium`}>{status.label}</Badge>
                      </div>
                    </div>

                    {/* Event details */}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-2 group-hover:text-violet-600 dark:group-hover:text-orange-400 transition-colors">
                        {event.title}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-violet-500 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                          <span>{formatDateRange(event.startDate, event.endDate)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500 dark:text-pink-400" />
                          <span>
                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-pink-500 dark:text-purple-400" />
                          <span>
                            {event.participants.length} participant{event.participants.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* New Meeting section */}
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4 text-green-500 dark:text-green-400" />
                          <span>
                            {event.meetings && event.meetings.length > 1 ? "Meetings" : "Meeting"}:{" "}
                            {formatMeetingInfo(event.meetings)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
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

        {/* Archived Events Section */}
        {(archivedEvents.length > 0 || existingEvents.length > 0) && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                onClick={() => setShowArchivedEvents(!showArchivedEvents)}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 p-0 h-auto font-normal"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archived Events ({archivedEvents.length}){showArchivedEvents ? " ▼" : " ▶"}
              </Button>
            </div>

            {showArchivedEvents && archivedEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Archive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h4>
                        <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 border-0 text-xs">
                          Archived
                        </Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>{event.participants.join(", ")}</span>
                        </div>

                        {event.confirmedMeeting && (
                          <div className="flex items-center gap-2">
                            <CalendarCheck className="w-3 h-3 text-green-500 dark:text-green-400" />
                            <span>
                              {new Date(event.confirmedMeeting.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}{" "}
                              at {formatTime(event.confirmedMeeting.time)}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{event.timeRange}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create New Event Button (when no events exist and not demo account) */}
        {existingEvents.length === 0 && !showCreateForm && !isDemoAccount && (
          <div className="text-center mb-12">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl p-12 border border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-orange-100 dark:to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-violet-600 dark:text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Create your first event</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                Start by creating a scheduling event and invite others to share their availability
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-600 dark:from-orange-500 dark:to-pink-500 hover:from-violet-600 hover:to-purple-700 dark:hover:from-orange-600 dark:hover:to-pink-600 text-white shadow-lg px-8 py-3 text-lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        )}

        {/* Demo account message when no events */}
        {existingEvents.length === 0 && isDemoAccount && (
          <div className="text-center mb-12">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-3xl p-12">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-2xl font-bold text-orange-900 dark:text-orange-100 mb-4">Demo Account</h3>
              <p className="text-orange-700 dark:text-orange-300 mb-8 max-w-md mx-auto">
                This is a demo account for testing purposes. Event creation and editing are disabled. Try logging in
                with a different demo account to see sample events.
              </p>
            </div>
          </div>
        )}

        {/* Create Event Form (only shown for non-demo accounts) */}
        {showCreateForm && !isDemoAccount && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 dark:from-orange-500 dark:to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5" />
                Create New Event
              </CardTitle>
              <CardDescription className="text-violet-100 dark:text-orange-100">
                Set up a new scheduling event and share it with others
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Cover Image Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Cover Image</Label>
                <CoverImageSelector value={coverImage} onChange={handleCoverImageChange} />
              </div>

              {/* Event Title Input */}
              <div className="space-y-2">
                <Label htmlFor="eventTitle" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Event Title *
                </Label>
                <Input
                  id="eventTitle"
                  placeholder="Team Meeting, Coffee Chat, etc."
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-orange-500 focus:ring-violet-500 dark:focus:ring-orange-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              {/* Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Start Date *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-orange-500 focus:ring-violet-500 dark:focus:ring-orange-500 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    End Date *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border-gray-200 dark:border-gray-700 focus:border-violet-500 dark:focus:border-orange-500 focus:ring-violet-500 dark:focus:ring-orange-500 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Start Time
                  </Label>
                  <select
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background focus:border-violet-500 dark:focus:border-orange-500 focus:ring-violet-500 dark:focus:ring-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:text-gray-100"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i
                      const ampm = hour >= 12 ? "PM" : "AM"
                      const hour12 = hour % 12 || 12
                      return (
                        <option key={i} value={`${hour12}:00 ${ampm}`}>
                          {hour12}:00 {ampm}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    End Time
                  </Label>
                  <select
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background focus:border-violet-500 dark:focus:border-orange-500 focus:ring-violet-500 dark:focus:ring-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:text-gray-100"
                  >
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i
                      const ampm = hour >= 12 ? "PM" : "AM"
                      const hour12 = hour % 12 || 12
                      return (
                        <option key={i} value={`${hour12}:00 ${ampm}`}>
                          {hour12}:00 {ampm}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              {/* Availability Selector (only show if dates are selected) */}
              {startDate && endDate && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Your Availability</Label>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                    <AvailabilitySelector
                      startDate={startDate}
                      endDate={endDate}
                      startTime={convertTo24Hour(startTime)}
                      endTime={convertTo24Hour(endTime)}
                      availability={availability}
                      onAvailabilityChange={setAvailability}
                    />
                  </div>
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateEvent}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 dark:from-orange-500 dark:to-pink-500 hover:from-violet-600 hover:to-purple-700 dark:hover:from-orange-600 dark:hover:to-pink-600 text-white shadow-lg flex-1"
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

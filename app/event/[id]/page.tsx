"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  Users,
  Share2,
  Copy,
  ArrowLeft,
  Crown,
  UserCheck,
  Edit2,
  Check,
  X,
  LogOut,
  User,
  Lock,
  Mail,
  CalendarCheck,
} from "lucide-react"
import { AvailabilitySelector } from "@/components/availability-selector"
import { HeatMap } from "@/components/heat-map"
import Link from "next/link"

// This defines what information we store about each meeting
interface Meeting {
  date: string
  time: string
  confirmedAt: string
}

// This defines what information we store about each person in an event
interface Participant {
  name: string
  email?: string // Optional email address for notifications
  availability: Record<string, boolean> // Which time slots they're available
}

// This defines what information we store about each event
interface EventData {
  title: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  creator: string
  coverImage: string
  coverImageAttribution?: string
  participants: Participant[]
  meetings?: Meeting[] // List of confirmed meetings
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

// This is the main event page component
// It shows event details, participants, and the availability heat map
export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  // These variables store the current state of the page
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [participantEmail, setParticipantEmail] = useState("") // New: email for new participants
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [shareUrl, setShareUrl] = useState("")
  const [userRole, setUserRole] = useState<"creator" | "participant" | "none">("none")
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null)
  const [editAvailability, setEditAvailability] = useState<Record<string, boolean>>({})

  // List of demo account usernames (these accounts can't edit)
  const demoAccounts = ["alice", "bob", "carol", "david"]
  const isDemoAccount = currentUser ? demoAccounts.includes(currentUser.username) : false

  // This runs when the page first loads
  useEffect(() => {
    // Check if someone is logged in
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Load event data from storage
    const storedData = localStorage.getItem(`event_${eventId}`)
    if (storedData) {
      setEventData(JSON.parse(storedData))
    }

    // Check what role the user has in this event
    const userEventsData = localStorage.getItem(`userEvents_${user.username}`)
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    const userEvent = userEventsList.find((ue) => ue.eventId === eventId)

    if (userEvent) {
      setUserRole(userEvent.role)
    }

    // Set the URL for sharing this event
    setShareUrl(window.location.href)
  }, [eventId, router])

  // This function logs the user out
  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  // This function converts 12-hour time to 24-hour time
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

  // This function simulates sending email notifications to participants
  const sendEmailNotifications = (eventData: EventData, newParticipant?: Participant) => {
    // In a real app, this would send actual emails
    // For now, we just show a message
    const recipients = eventData.participants
      .filter((p) => p.email)
      .map((p) => p.email)
      .join(", ")

    if (recipients) {
      console.log(`📧 Email notifications sent to: ${recipients}`)
      alert(`📧 Email notifications sent to all participants with email addresses!`)
    }
  }

  // This function handles when a meeting time is confirmed
  const handleMeetingConfirmed = (date: string, time: string) => {
    if (!eventData) return

    const newMeeting: Meeting = {
      date,
      time,
      confirmedAt: new Date().toISOString(),
    }

    const updatedEventData = {
      ...eventData,
      meetings: [...(eventData.meetings || []), newMeeting],
    }

    localStorage.setItem(`event_${eventId}`, JSON.stringify(updatedEventData))
    setEventData(updatedEventData)

    // Send email notifications about the confirmed meeting
    sendEmailNotifications(updatedEventData)

    alert(`Meeting confirmed for ${formatDateTime(date, time)}!`)
  }

  // This function adds a new person to the event
  const handleJoinEvent = () => {
    // Make sure name is filled out
    if (!participantName.trim()) {
      alert("Please enter your name")
      return
    }

    if (!eventData || !currentUser) return

    // Create the new participant
    const newParticipant = {
      name: participantName,
      email: participantEmail || undefined,
      availability,
    }

    // Add them to the event
    const updatedEventData = {
      ...eventData,
      participants: [...eventData.participants, newParticipant],
    }

    // Save the updated event
    localStorage.setItem(`event_${eventId}`, JSON.stringify(updatedEventData))
    setEventData(updatedEventData)

    // Connect the user to this event
    const userEventsData = localStorage.getItem(`userEvents_${currentUser.username}`)
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    userEventsList.push({
      eventId,
      role: "participant",
      participantName: participantName,
    })
    localStorage.setItem(`userEvents_${currentUser.username}`, JSON.stringify(userEventsList))

    // Send email notifications
    sendEmailNotifications(updatedEventData, newParticipant)

    // Update the page state
    setUserRole("participant")
    setParticipantName("")
    setParticipantEmail("")
    setAvailability({})
  }

  // This function starts editing someone's availability
  const handleEditAvailability = (participantName: string) => {
    if (!eventData) return

    const participant = eventData.participants.find((p) => p.name === participantName)
    if (participant) {
      setEditAvailability(participant.availability)
      setEditingParticipant(participantName)
    }
  }

  // This function saves changes to someone's availability
  const handleSaveEdit = () => {
    if (!eventData || !editingParticipant) return

    const updatedEventData = {
      ...eventData,
      participants: eventData.participants.map((p) =>
        p.name === editingParticipant ? { ...p, availability: editAvailability } : p,
      ),
    }

    localStorage.setItem(`event_${eventId}`, JSON.stringify(updatedEventData))
    setEventData(updatedEventData)
    setEditingParticipant(null)
    setEditAvailability({})

    // Send email notifications about the update
    sendEmailNotifications(updatedEventData)
  }

  // This function cancels editing availability
  const handleCancelEdit = () => {
    setEditingParticipant(null)
    setEditAvailability({})
  }

  // This function copies the event URL to clipboard
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    alert("Link copied to clipboard! 🎉")
  }

  // This function checks if someone can edit a participant's availability
  const canEditParticipant = (participantName: string) => {
    if (isDemoAccount) return false // Demo accounts can't edit anything
    return userRole === "creator" || (userRole === "participant" && participantName === currentUser?.name)
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

  // This function formats times to look nice
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // This function formats date and time together
  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date)
    const formattedDate = dateObj
      .toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        weekday: "long",
      })
      .replace(/(\w+), (\w+ \d+, \d+)/, "$2 - $1")
    return `${formattedDate} at ${formatTime(time)}`
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

  // Show loading message while checking login
  if (!currentUser) {
    return <div>Loading...</div>
  }

  // Show error message if event doesn't exist
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

  const isUserParticipant = eventData.participants.some((p) => p.name === currentUser.name)

  // This is what shows up on the screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                I'm Free
              </h1>
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <User className="w-4 h-4 text-violet-600" />
              <span className="font-medium text-gray-700">{currentUser.name}</span>
              {isDemoAccount && (
                <Badge className="bg-orange-100 text-orange-700 border-0 text-xs flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Demo
                </Badge>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Event Header Card */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
          {/* Cover Image */}
          {eventData.coverImage ? (
            <div className="relative">
              <div
                className="h-48 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${eventData.coverImage})` }}
              >
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{eventData.title}</h2>
                </div>
              </div>
              {eventData.coverImageAttribution && (
                <p className="text-xs text-gray-500 p-2">{eventData.coverImageAttribution}</p>
              )}
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-violet-400 via-purple-500 to-pink-500 relative">
              <div className="absolute bottom-4 left-6 text-white">
                <h2 className="text-3xl font-bold mb-2">{eventData.title}</h2>
              </div>
            </div>
          )}

          {/* Event Details */}
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date Range</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateRange(eventData.startDate, eventData.endDate)}
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
                    {formatTime(eventData.startTime)} - {formatTime(eventData.endTime)}
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

              {/* New Meeting section */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">
                    {eventData.meetings && eventData.meetings.length > 1 ? "Meetings" : "Meeting"}
                  </p>
                  <p className="font-semibold text-gray-900">{formatMeetingInfo(eventData.meetings)}</p>
                </div>
              </div>
            </div>

            {/* Creator and Participant Info */}
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Created by</span>
                <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-0 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  {eventData.creator}
                  {userRole === "creator" && " (You)"}
                </Badge>
                <div className="flex gap-1 ml-2">
                  {eventData.participants.slice(1).map((participant, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="border-gray-200 text-gray-600 flex items-center gap-1"
                    >
                      <UserCheck className="w-3 h-3" />
                      {participant.name}
                      {participant.name === currentUser.name && " (You)"}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Join Event and Share Buttons */}
              <div className="flex gap-2">
                {userRole === "none" && !isUserParticipant && !isDemoAccount && (
                  <div className="flex items-center gap-2">
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter your name"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        className="w-40 h-9 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                      />
                      <Input
                        placeholder="Email (optional)"
                        type="email"
                        value={participantEmail}
                        onChange={(e) => setParticipantEmail(e.target.value)}
                        className="w-40 h-9 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                      />
                    </div>
                    <Button
                      onClick={handleJoinEvent}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Join Event
                    </Button>
                  </div>
                )}

                {/* Demo account message */}
                {userRole === "none" && !isUserParticipant && isDemoAccount && (
                  <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">Demo Mode - Cannot Join</span>
                  </div>
                )}

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
            </div>
          </CardContent>
        </Card>

        {/* Participants List with Edit Options */}
        {eventData.participants.length > 0 && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="w-5 h-5" />
                Participants & Availability
              </CardTitle>
              <CardDescription className="text-blue-100">
                {isDemoAccount
                  ? "View participant availability (editing disabled in demo mode)"
                  : "Manage participant availability - creators can edit anyone, participants can edit their own"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {eventData.participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-violet-600">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          {participant.name}
                          {participant.name === eventData.creator && (
                            <Badge className="bg-violet-100 text-violet-700 border-0 text-xs flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Creator
                            </Badge>
                          )}
                          {participant.name === currentUser.name && (
                            <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">You</Badge>
                          )}
                          {participant.email && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-xs flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              Email
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {Object.values(participant.availability).filter(Boolean).length} time slots selected
                          {participant.email && <span className="text-green-600 ml-2">• {participant.email}</span>}
                        </p>
                      </div>
                    </div>
                    {canEditParticipant(participant.name) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAvailability(participant.name)}
                        className="border-violet-200 text-violet-600 hover:bg-violet-50"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Availability
                      </Button>
                    )}
                    {isDemoAccount && (
                      <div className="flex items-center gap-2 text-orange-600">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm">Demo Mode</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Availability Modal */}
        {editingParticipant && !isDemoAccount && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Edit Availability for {editingParticipant}</CardTitle>
              <CardDescription className="text-orange-100">
                Update the availability using click and drag
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <AvailabilitySelector
                  startDate={eventData.startDate}
                  endDate={eventData.endDate}
                  startTime={eventData.startTime}
                  endTime={eventData.endTime}
                  availability={editAvailability}
                  onAvailabilityChange={setEditAvailability}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg flex-1"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Heat Map */}
        {eventData.participants.length > 0 && !editingParticipant && (
          <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-5 h-5" />
                Availability Heat Map
              </CardTitle>
              <CardDescription className="text-emerald-100">Discover when everyone is free</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <HeatMap
                startDate={eventData.startDate}
                endDate={eventData.endDate}
                startTime={eventData.startTime}
                endTime={eventData.endTime}
                participants={eventData.participants}
                onMeetingConfirmed={handleMeetingConfirmed}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

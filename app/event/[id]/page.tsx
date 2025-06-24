"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Sparkles, ArrowLeft, LogOut, User } from "lucide-react"
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
  coverImageAttribution?: string
  participants: Participant[]
}

interface UserEventData {
  eventId: string
  role: "creator" | "participant"
  participantName?: string
}

interface CurrentUser {
  username: string
  name: string
}

export default function EventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [participantName, setParticipantName] = useState("")
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [shareUrl, setShareUrl] = useState("")
  const [userRole, setUserRole] = useState<"creator" | "participant" | "none">("none")
  const [editingParticipant, setEditingParticipant] = useState<string | null>(null)
  const [editAvailability, setEditAvailability] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }

    const user = JSON.parse(userData)
    setCurrentUser(user)

    // Load event data from localStorage
    const storedData = localStorage.getItem(`event_${eventId}`)
    if (storedData) {
      setEventData(JSON.parse(storedData))
    }

    // Check user's role in this event
    const userEventsData = localStorage.getItem(`userEvents_${user.username}`)
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    const userEvent = userEventsList.find((ue) => ue.eventId === eventId)

    if (userEvent) {
      setUserRole(userEvent.role)
    }

    // Set share URL
    setShareUrl(window.location.href)
  }, [eventId, router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

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

  const handleJoinEvent = () => {
    if (!participantName.trim()) {
      alert("Please enter your name")
      return
    }

    if (!eventData || !currentUser) return

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

    // Update user events
    const userEventsData = localStorage.getItem(`userEvents_${currentUser.username}`)
    const userEventsList: UserEventData[] = userEventsData ? JSON.parse(userEventsData) : []
    userEventsList.push({
      eventId,
      role: "participant",
      participantName: participantName,
    })
    localStorage.setItem(`userEvents_${currentUser.username}`, JSON.stringify(userEventsList))

    setUserRole("participant")
    setParticipantName("")
    setAvailability({})
  }

  const handleEditAvailability = (participantName: string) => {
    if (!eventData) return

    const participant = eventData.participants.find((p) => p.name === participantName)
    if (participant) {
      setEditAvailability(participant.availability)
      setEditingParticipant(participantName)
    }
  }

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
  }

  const handleCancelEdit = () => {
    setEditingParticipant(null)
    setEditAvailability({})
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl)
    alert("Link copied to clipboard! 🎉")
  }

  const canEditParticipant = (participantName: string) => {
    return userRole === "creator" || (userRole === "participant" && participantName === currentUser?.name)
  }

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

    const formatDayOnly = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
      })
    }

    if (start.toDateString() === end.toDateString()) {
      return `${formatDateOnly(start)}\n${formatDayOnly(start)}`
    }

    const startMonth = start.getMonth()
    const endMonth = end.getMonth()
    const startYear = start.getFullYear()
    const endYear = end.getFullYear()

    let dateRange = ""
    if (startYear === endYear) {
      if (startMonth === endMonth) {
        // Same month and year
        dateRange = `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} to ${end.getDate()}, ${startYear}`
      } else {
        // Different months, same year
        dateRange = `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} to ${end.toLocaleDateString("en-US", { month: "long", day: "numeric" })}, ${startYear}`
      }
    } else {
      // Different years
      dateRange = `${formatDateOnly(start)} to ${formatDateOnly(end)}`
    }

    const dayRange = `${formatDayOnly(start)} to ${formatDayOnly(end)}`

    return `${dateRange}\n${dayRange}`
  }

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  if (!currentUser) {
    return <div>Loading...</div>
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

  const isUserParticipant = eventData.participants.some((p) => p.name === currentUser.name)

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
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
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                I'm Free
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <User className="w-4 h-4 text-violet-600" />
              <span className="font-medium text-gray-700">{currentUser.name}</span>
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

          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Date Range</p>
                  <p className="font-semibold text-gray-900 whitespace-pre-line">
                    {formatDateRange(eventData.startDate, eventData.endDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className\

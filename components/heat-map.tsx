"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ChevronDown, CalendarIcon, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

// This defines what information we need about each person
interface Participant {
  name: string
  email?: string // Optional email address
  availability: Record<string, boolean> // Which time slots they're free
}

// This defines what information the heat map component needs
interface HeatMapProps {
  startDate: string // When the event starts (like "2025-01-06")
  endDate: string // When the event ends
  startTime: string // What time each day starts (like "09:00")
  endTime: string // What time each day ends (like "17:00")
  participants: Participant[] // List of all people in the event
  onMeetingConfirmed?: (date: string, time: string) => void // Function to call when a meeting is confirmed
}

// This component shows a colorful grid that helps find the best meeting times
// Green = everyone is free, yellow/orange = some people are free, gray = nobody is free
export function HeatMap({ startDate, endDate, startTime, endTime, participants, onMeetingConfirmed }: HeatMapProps) {
  // These variables store information we calculate
  const [timeSlots, setTimeSlots] = useState<string[]>([]) // All the time slots (like 9:00, 9:30, 10:00)
  const [dates, setDates] = useState<string[]>([]) // All the dates in the event
  const [bestTimes, setBestTimes] = useState<Array<{ date: string; time: string; count: number }>>([]) // Times when everyone is free
  const [partialMatches, setPartialMatches] = useState<Array<{ date: string; time: string; count: number }>>([]) // Times when some people are free
  const [showBestTimes, setShowBestTimes] = useState(true) // Whether to show the "perfect matches" section
  const [showPartialMatches, setShowPartialMatches] = useState(false) // Whether to show the "other matches" section

  // This stores information about the tooltip (the little popup when you hover over a number)
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; content: string }>({
    show: false,
    x: 0,
    y: 0,
    content: "",
  })

  // This function picks the right color based on how many people are available
  const getAvailabilityColor = (count: number, total: number) => {
    if (count === 0) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" // Nobody available = gray

    const intensity = count / total // What percentage of people are free

    if (intensity === 1) return "bg-emerald-500 text-white dark:bg-emerald-600 dark:text-white" // Everyone free = green
    if (intensity >= 0.8) return "bg-emerald-400 text-white dark:bg-emerald-500 dark:text-white" // Most people free = light green
    if (intensity >= 0.6) return "bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white" // More than half free = yellow
    if (intensity >= 0.4) return "bg-orange-400 text-white dark:bg-orange-500 dark:text-white" // Some people free = orange
    if (intensity >= 0.2) return "bg-blue-400 text-white dark:bg-blue-500 dark:text-white" // Few people free = blue
    return "bg-blue-300 text-gray-700 dark:bg-blue-400 dark:text-gray-200" // Very few people free = light blue
  }

  // This function finds out who is available at a specific time
  const getAvailableParticipants = (date: string, time: string) => {
    const key = `${date}_${time}` // Create a unique key for this time slot
    return participants.filter((p) => p.availability[key]).map((p) => p.name) // Get names of available people
  }

  // This function shows a tooltip when you hover over a number in the grid
  const handleMouseEnter = (event: React.MouseEvent, date: string, time: string) => {
    const availableNames = getAvailableParticipants(date, time)
    if (availableNames.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltip({
        show: true,
        x: rect.left + rect.width / 2, // Position tooltip in center of the cell
        y: rect.top - 10, // Position tooltip above the cell
        content: availableNames.join(", "), // Show all available people's names
      })
    }
  }

  // This function hides the tooltip when you stop hovering
  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: "" })
  }

  // This function creates a Google Calendar link for a specific time slot
  const createGoogleCalendarLink = (date: string, time: string, eventTitle = "Meeting") => {
    // Convert our date and time into the format Google Calendar expects
    const startDateTime = new Date(`${date}T${time}:00`)
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // Add 1 hour

    // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
    const formatForGoogle = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
    }

    const startFormatted = formatForGoogle(startDateTime)
    const endFormatted = formatForGoogle(endDateTime)

    // Get list of available participants for the event description
    const availableParticipants = getAvailableParticipants(date, time)
    const description = `Meeting with: ${availableParticipants.join(", ")}`

    // Create the Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}`

    return googleCalendarUrl
  }

  // This function handles when someone confirms a meeting time with the star button
  const handleConfirmMeeting = (date: string, time: string) => {
    if (onMeetingConfirmed) {
      onMeetingConfirmed(date, time)
    }
  }

  // This runs when the component first loads or when the dates/times change
  // It calculates all the time slots and finds the best meeting times
  useEffect(() => {
    // Create a list of all dates in the event
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dateArray: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d).toISOString().split("T")[0])
    }
    setDates(dateArray)

    // Create a list of all time slots (every 30 minutes)
    const startHour = Number.parseInt(startTime.split(":")[0])
    const startMinute = Number.parseInt(startTime.split(":")[1])
    const endHour = Number.parseInt(endTime.split(":")[0])
    const endMinute = Number.parseInt(endTime.split(":")[1])

    const slots: string[] = []
    let currentHour = startHour
    let currentMinute = startMinute

    // Keep adding 30-minute slots until we reach the end time
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`
      slots.push(timeString)

      currentMinute += 30
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour++
      }
    }
    setTimeSlots(slots)

    // Count how many people are available for each time slot
    const timeSlotCounts: Array<{ date: string; time: string; count: number }> = []

    dateArray.forEach((date) => {
      slots.forEach((time) => {
        const key = `${date}_${time}`
        const count = participants.filter((p) => p.availability[key]).length
        if (count > 0) {
          timeSlotCounts.push({ date, time, count })
        }
      })
    })

    // Separate perfect matches (everyone available) from partial matches (some people available)
    const perfectMatches = timeSlotCounts.filter((slot) => slot.count === participants.length)
    const partialMatchesData = timeSlotCounts.filter((slot) => slot.count < participants.length && slot.count > 0)

    // Sort both lists by how many people are available (most first)
    const sortedPerfectMatches = perfectMatches.sort((a, b) => b.count - a.count)
    const sortedPartialMatches = partialMatchesData.sort((a, b) => b.count - a.count).slice(0, 10)

    setBestTimes(sortedPerfectMatches)
    setPartialMatches(sortedPartialMatches)
  }, [startDate, endDate, startTime, endTime, participants])

  // This function counts how many people are available at a specific time
  const getAvailabilityCount = (date: string, time: string) => {
    const key = `${date}_${time}`
    return participants.filter((p) => p.availability[key]).length
  }

  // This function picks the right background color for each cell in the grid
  const getIntensityColor = (count: number) => {
    const maxCount = participants.length
    if (count === 0) return "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"

    const intensity = count / maxCount

    // Use gradients to make it look nice
    if (intensity === 1)
      return "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 shadow-lg dark:from-emerald-600 dark:to-green-700 dark:border-emerald-600"
    if (intensity >= 0.8)
      return "bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-400 shadow-md dark:from-emerald-500 dark:to-green-600 dark:border-emerald-500"
    if (intensity >= 0.6)
      return "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-400 shadow-md dark:from-yellow-500 dark:to-orange-600 dark:border-yellow-500"
    if (intensity >= 0.4)
      return "bg-gradient-to-br from-orange-300 to-yellow-400 border-orange-300 shadow-sm dark:from-orange-400 dark:to-yellow-500 dark:border-orange-400"
    if (intensity >= 0.2)
      return "bg-gradient-to-br from-blue-300 to-purple-400 border-blue-300 shadow-sm dark:from-blue-400 dark:to-purple-500 dark:border-blue-400"
    return "bg-gradient-to-br from-blue-200 to-purple-300 border-blue-200 dark:from-blue-300 dark:to-purple-400 dark:border-blue-300"
  }

  // This function picks the right text color for each cell
  const getTextColor = (count: number) => {
    const maxCount = participants.length
    const intensity = count / maxCount
    return intensity >= 0.4 ? "text-white font-bold" : "text-gray-700 dark:text-gray-200 font-semibold"
  }

  // This function formats dates to look nice (like "January 6, 2025 - Monday")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date
      .toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        weekday: "long",
      })
      .replace(/(\w+), (\w+ \d+, \d+)/, "$2 - $1")
  }

  // This function formats times to look nice (like "9:00 AM")
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // This function combines date and time for display
  const formatDateTime = (date: string, time: string) => {
    return `${formatDate(date)} at ${formatTime(time)}`
  }

  // This is what shows up on the screen
  return (
    <div className="space-y-6 relative">
      {/* Tooltip - the little popup that shows who's available */}
      {tooltip.show && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <div className="font-medium">Available:</div>
          <div>{tooltip.content}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
        </div>
      )}

      {/* Perfect Time Matches - now collapsible like other matches */}
      {bestTimes.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
          <button
            onClick={() => setShowBestTimes(!showBestTimes)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-lg flex items-center gap-2">
              Perfect Time Matches
            </h3>
            <ChevronDown
              className={`w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-transform ${showBestTimes ? "rotate-180" : ""}`}
            />
          </button>
          <p className="text-emerald-700 dark:text-emerald-300 text-sm mb-4">Times when everyone is available</p>

          {showBestTimes && (
            <div className="space-y-3">
              {bestTimes.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                >
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                    {formatDateTime(suggestion.date, suggestion.time)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-semibold ${getAvailabilityColor(suggestion.count, participants.length)}`}
                    >
                      {suggestion.count}/{participants.length} available
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmMeeting(suggestion.date, suggestion.time)}
                      className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white"
                      title="Confirm this meeting time"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        window.open(
                          createGoogleCalendarLink(suggestion.date, suggestion.time, "Team Meeting"),
                          "_blank",
                        )
                      }
                      className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                      title="Add to Google Calendar"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Partial Matches - times when some people are available (can be hidden/shown) */}
      {partialMatches.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <button
            onClick={() => setShowPartialMatches(!showPartialMatches)}
            className="w-full flex items-center justify-between text-left"
          >
            <h3 className="font-bold text-blue-800 dark:text-blue-300 text-lg flex items-center gap-2">
              See Other Time Matches
            </h3>
            <ChevronDown
              className={`w-5 h-5 text-blue-600 dark:text-blue-400 transition-transform ${showPartialMatches ? "rotate-180" : ""}`}
            />
          </button>

          {showPartialMatches && (
            <div className="space-y-3 mt-4">
              {partialMatches.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                >
                  <span className="text-blue-700 dark:text-blue-300 font-medium">
                    {formatDateTime(suggestion.date, suggestion.time)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm px-3 py-1 rounded-full font-semibold ${getAvailabilityColor(suggestion.count, participants.length)}`}
                    >
                      {suggestion.count}/{participants.length} available
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleConfirmMeeting(suggestion.date, suggestion.time)}
                      className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white"
                      title="Confirm this meeting time"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        window.open(
                          createGoogleCalendarLink(suggestion.date, suggestion.time, "Team Meeting"),
                          "_blank",
                        )
                      }
                      className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                      title="Add to Google Calendar"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend explaining what the colors mean - moved to top */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-200 font-semibold">Availability Intensity:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">None</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-200 to-purple-300 dark:from-blue-300 dark:to-purple-400 border-2 border-blue-200 dark:border-blue-300 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600 border-2 border-yellow-400 dark:border-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 dark:from-emerald-600 dark:to-green-700 border-2 border-emerald-500 dark:border-emerald-600 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heat Map Grid - the colorful grid showing all time slots */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-1 gap-3">
            {/* Header row showing all the dates */}
            <div className="flex">
              <div className="w-20 flex-shrink-0"></div>
              {dates.map((date) => (
                <div key={date} className="w-24 text-center text-sm font-bold text-gray-700 dark:text-gray-200 p-2">
                  {formatDate(date).split(" - ")[1]}
                  <br />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(date).split(" - ")[0]}</span>
                </div>
              ))}
            </div>

            {/* Rows for each time slot */}
            {timeSlots.map((time) => (
              <div key={time} className="flex items-center">
                <div className="w-20 flex-shrink-0 text-sm text-gray-600 dark:text-gray-300 pr-2 font-semibold">
                  {formatTime(time)}
                </div>
                {dates.map((date) => {
                  const count = getAvailabilityCount(date, time)
                  const intensityColor = getIntensityColor(count)
                  const textColor = getTextColor(count)
                  return (
                    <div
                      key={`${date}_${time}`}
                      className={`w-24 h-12 border-2 flex items-center justify-center text-sm transition-all duration-300 hover:scale-105 rounded-lg mx-0.5 cursor-pointer ${intensityColor} ${textColor}`}
                      onMouseEnter={(e) => handleMouseEnter(e, date, time)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {count > 0 ? count : ""}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

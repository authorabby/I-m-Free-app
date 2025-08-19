"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarCheck, CalendarIcon, Plus } from "lucide-react"

// This defines what information we store about each person in an event
interface Participant {
  name: string
  email?: string
  availability: Record<string, boolean>
}

// This defines the props for the HeatMap component
interface HeatMapProps {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  participants: Participant[]
  onMeetingConfirmed?: (date: string, time: string) => void
}

// This is the main heat map component
// It shows when people are available using colors
export function HeatMap({ startDate, endDate, startTime, endTime, participants, onMeetingConfirmed }: HeatMapProps) {
  // These variables store the current state of the heat map
  const [dates, setDates] = useState<string[]>([])
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [availabilityData, setAvailabilityData] = useState<Record<string, number>>({})

  // This runs when the component first loads or when the props change
  useEffect(() => {
    generateDatesAndTimes()
    calculateAvailability()
  }, [startDate, endDate, startTime, endTime, participants])

  // This function creates all the dates and time slots for the event
  const generateDatesAndTimes = () => {
    // Create array of dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dateArray: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d).toISOString().split("T")[0])
    }

    setDates(dateArray)

    // Create array of time slots (30-minute intervals)
    const startHour = Number.parseInt(startTime.split(":")[0])
    const startMinute = Number.parseInt(startTime.split(":")[1])
    const endHour = Number.parseInt(endTime.split(":")[0])
    const endMinute = Number.parseInt(endTime.split(":")[1])

    const slots: string[] = []
    let currentHour = startHour
    let currentMinute = startMinute

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
  }

  // This function counts how many people are available for each time slot
  const calculateAvailability = () => {
    const availability: Record<string, number> = {}

    dates.forEach((date) => {
      timeSlots.forEach((time) => {
        const key = `${date}_${time}`
        const availableCount = participants.filter((participant) => participant.availability[key]).length
        availability[key] = availableCount
      })
    })

    setAvailabilityData(availability)
  }

  // This function determines what color to show for each time slot
  const getIntensityColor = (availableCount: number, totalParticipants: number) => {
    if (availableCount === 0) {
      return "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    }

    const intensity = availableCount / totalParticipants

    if (intensity === 1) {
      return "bg-emerald-500 dark:bg-emerald-600 border-emerald-600 dark:border-emerald-500 text-white"
    } else if (intensity >= 0.75) {
      return "bg-emerald-400 dark:bg-emerald-500 border-emerald-500 dark:border-emerald-400 text-white"
    } else if (intensity >= 0.5) {
      return "bg-yellow-400 dark:bg-yellow-500 border-yellow-500 dark:border-yellow-400 text-gray-900"
    } else if (intensity >= 0.25) {
      return "bg-orange-400 dark:bg-orange-500 border-orange-500 dark:border-orange-400 text-white"
    } else {
      return "bg-red-400 dark:bg-red-500 border-red-500 dark:border-red-400 text-white"
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

  // This function formats dates to look nice
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      weekday: "short",
    })
  }

  // This function handles when someone clicks on a time slot to confirm a meeting
  const handleSlotClick = (date: string, time: string, availableCount: number) => {
    if (availableCount === participants.length && onMeetingConfirmed) {
      const confirmed = window.confirm(
        `Confirm meeting for ${formatDate(date)} at ${formatTime(time)}?\n\nAll ${participants.length} participants are available at this time.`,
      )
      if (confirmed) {
        onMeetingConfirmed(date, time)
      }
    }
  }

  // This is what shows up on the screen
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Availability intensity legend */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Availability Intensity</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span>Less available</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded"></div>
                <div className="w-4 h-4 bg-red-400 dark:bg-red-500 border border-red-500 dark:border-red-400 rounded"></div>
                <div className="w-4 h-4 bg-orange-400 dark:bg-orange-500 border border-orange-500 dark:border-orange-400 rounded"></div>
                <div className="w-4 h-4 bg-yellow-400 dark:bg-yellow-500 border border-yellow-500 dark:border-yellow-400 rounded"></div>
                <div className="w-4 h-4 bg-emerald-400 dark:bg-emerald-500 border border-emerald-500 dark:border-emerald-400 rounded"></div>
                <div className="w-4 h-4 bg-emerald-500 dark:bg-emerald-600 border border-emerald-600 dark:border-emerald-500 rounded"></div>
              </div>
              <span>More available</span>
            </div>
          </div>
        </div>

        {/* Heat map grid */}
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header row with dates */}
            <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `120px repeat(${dates.length}, 120px)` }}>
              <div className="h-12"></div>
              {dates.map((date) => (
                <div key={date} className="text-center p-2 font-medium text-gray-700 dark:text-gray-300">
                  <div className="text-sm">{formatDate(date)}</div>
                </div>
              ))}
            </div>

            {/* Time slots and availability grid */}
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid gap-1 mb-1"
                style={{ gridTemplateColumns: `120px repeat(${dates.length}, 120px)` }}
              >
                {/* Time label */}
                <div className="flex items-center justify-end pr-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {formatTime(time)}
                </div>

                {/* Availability cells for each date */}
                {dates.map((date) => {
                  const key = `${date}_${time}`
                  const availableCount = availabilityData[key] || 0
                  const isFullyAvailable = availableCount === participants.length
                  const colorClass = getIntensityColor(availableCount, participants.length)

                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          className={`h-12 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${colorClass} ${
                            isFullyAvailable && availableCount > 0
                              ? "hover:ring-2 hover:ring-emerald-300 dark:hover:ring-emerald-400 cursor-pointer"
                              : "cursor-default"
                          }`}
                          onClick={() => handleSlotClick(date, time, availableCount)}
                        >
                          <div className="flex items-center justify-center h-full">
                            {isFullyAvailable && availableCount > 0 && (
                              <div className="flex items-center gap-1">
                                <CalendarCheck className="w-4 h-4" />
                                <Plus className="w-3 h-3" />
                              </div>
                            )}
                            {!isFullyAvailable && availableCount > 0 && (
                              <span className="text-xs font-semibold">{availableCount}</span>
                            )}
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-semibold">
                            {formatDate(date)} at {formatTime(time)}
                          </p>
                          <p className="text-sm">
                            {availableCount} of {participants.length} available
                          </p>
                          {availableCount > 0 && (
                            <div className="mt-2 text-xs">
                              <p className="font-medium">Available:</p>
                              {participants
                                .filter((p) => p.availability[key])
                                .map((p) => (
                                  <p key={p.name}>{p.name}</p>
                                ))}
                            </div>
                          )}
                          {isFullyAvailable && availableCount > 0 && (
                            <p className="mt-2 text-xs font-medium text-emerald-200">Click to confirm meeting time</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Summary information */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">How to use the heat map</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Green cells show when everyone is available</li>
                  <li>• Numbers show how many people are available</li>
                  <li>• Click on fully green cells to confirm meeting times</li>
                  <li>• Hover over any cell to see who's available</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}

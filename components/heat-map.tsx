"use client"

import { useState, useEffect } from "react"

interface Participant {
  name: string
  availability: Record<string, boolean>
}

interface HeatMapProps {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  participants: Participant[]
}

export function HeatMap({ startDate, endDate, startTime, endTime, participants }: HeatMapProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [dates, setDates] = useState<string[]>([])
  const [bestTimes, setBestTimes] = useState<Array<{ date: string; time: string; count: number }>>([])

  useEffect(() => {
    // Generate date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const dateArray: string[] = []

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(new Date(d).toISOString().split("T")[0])
    }
    setDates(dateArray)

    // Generate time slots (30-minute intervals)
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

    // Calculate best times
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

    // Sort by count (descending) and take top suggestions
    const sortedTimes = timeSlotCounts.sort((a, b) => b.count - a.count).slice(0, 5)

    setBestTimes(sortedTimes)
  }, [startDate, endDate, startTime, endTime, participants])

  const getAvailabilityCount = (date: string, time: string) => {
    const key = `${date}_${time}`
    return participants.filter((p) => p.availability[key]).length
  }

  const getIntensityColor = (count: number) => {
    const maxCount = participants.length
    if (count === 0) return "bg-gray-100"

    const intensity = count / maxCount
    if (intensity === 1) return "bg-green-600"
    if (intensity >= 0.8) return "bg-green-500"
    if (intensity >= 0.6) return "bg-green-400"
    if (intensity >= 0.4) return "bg-green-300"
    if (intensity >= 0.2) return "bg-green-200"
    return "bg-green-100"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(date)
    return `${dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })} at ${time}`
  }

  return (
    <div className="space-y-6">
      {/* Best Time Suggestions */}
      {bestTimes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3">🎯 Best Time Suggestions</h3>
          <div className="space-y-2">
            {bestTimes.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-green-700">{formatDateTime(suggestion.date, suggestion.time)}</span>
                <span className="text-sm bg-green-200 text-green-800 px-2 py-1 rounded">
                  {suggestion.count}/{participants.length} available
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heat Map Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-1 gap-2">
            {/* Header */}
            <div className="flex">
              <div className="w-20 flex-shrink-0"></div>
              {dates.map((date) => (
                <div key={date} className="w-24 text-center text-sm font-medium p-2">
                  {formatDate(date)}
                </div>
              ))}
            </div>

            {/* Time slots */}
            {timeSlots.map((time) => (
              <div key={time} className="flex items-center">
                <div className="w-20 flex-shrink-0 text-sm text-gray-600 pr-2">{time}</div>
                {dates.map((date) => {
                  const count = getAvailabilityCount(date, time)
                  const intensityColor = getIntensityColor(count)
                  return (
                    <div
                      key={`${date}_${time}`}
                      className={`w-24 h-8 border border-gray-200 flex items-center justify-center text-xs font-medium ${intensityColor} ${
                        count > 0 ? "text-white" : "text-gray-400"
                      }`}
                      title={`${count}/${participants.length} available`}
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

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-600">Availability:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200"></div>
          <span>None</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 border border-gray-200"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 border border-gray-200"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 border border-gray-200"></div>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}

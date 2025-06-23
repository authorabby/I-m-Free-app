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
    if (count === 0) return "bg-gray-50 border-gray-200"

    const intensity = count / maxCount

    // More vibrant color progression
    if (intensity === 1) return "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-500 shadow-lg"
    if (intensity >= 0.8) return "bg-gradient-to-br from-emerald-400 to-green-500 border-emerald-400 shadow-md"
    if (intensity >= 0.6) return "bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-400 shadow-md"
    if (intensity >= 0.4) return "bg-gradient-to-br from-orange-300 to-yellow-400 border-orange-300 shadow-sm"
    if (intensity >= 0.2) return "bg-gradient-to-br from-blue-300 to-purple-400 border-blue-300 shadow-sm"
    return "bg-gradient-to-br from-blue-200 to-purple-300 border-blue-200"
  }

  const getTextColor = (count: number) => {
    const maxCount = participants.length
    const intensity = count / maxCount
    return intensity >= 0.4 ? "text-white font-bold" : "text-gray-700 font-semibold"
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
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
          <h3 className="font-bold text-emerald-800 mb-4 text-lg flex items-center gap-2">🎯 Perfect Time Matches</h3>
          <div className="space-y-3">
            {bestTimes.map((suggestion, index) => (
              <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                <span className="text-emerald-700 font-medium">{formatDateTime(suggestion.date, suggestion.time)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">
                    {suggestion.count}/{participants.length} available
                  </span>
                  {suggestion.count === participants.length && <span className="text-emerald-600">✨</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Heat Map Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-1 gap-3">
            {/* Header */}
            <div className="flex">
              <div className="w-20 flex-shrink-0"></div>
              {dates.map((date) => (
                <div key={date} className="w-24 text-center text-sm font-bold text-gray-700 p-2">
                  {formatDate(date)}
                </div>
              ))}
            </div>

            {/* Time slots */}
            {timeSlots.map((time) => (
              <div key={time} className="flex items-center">
                <div className="w-20 flex-shrink-0 text-sm text-gray-600 pr-2 font-semibold">{time}</div>
                {dates.map((date) => {
                  const count = getAvailabilityCount(date, time)
                  const intensityColor = getIntensityColor(count)
                  const textColor = getTextColor(count)
                  return (
                    <div
                      key={`${date}_${time}`}
                      className={`w-24 h-12 border-2 flex items-center justify-center text-sm transition-all duration-300 hover:scale-105 rounded-lg mx-0.5 ${intensityColor} ${textColor}`}
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

      {/* Enhanced Legend */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-semibold">Availability Intensity:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-50 border-2 border-gray-200 rounded"></div>
              <span className="text-sm text-gray-600">None</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-200 to-purple-300 border-2 border-blue-200 rounded"></div>
              <span className="text-sm text-gray-600">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-yellow-400 rounded"></div>
              <span className="text-sm text-gray-600">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 border-2 border-emerald-500 rounded"></div>
              <span className="text-sm text-gray-600">High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

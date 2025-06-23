"use client"

import { useState, useEffect } from "react"

interface AvailabilitySelectorProps {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  availability: Record<string, boolean>
  onAvailabilityChange: (availability: Record<string, boolean>) => void
}

export function AvailabilitySelector({
  startDate,
  endDate,
  startTime,
  endTime,
  availability,
  onAvailabilityChange,
}: AvailabilitySelectorProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [dates, setDates] = useState<string[]>([])

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
  }, [startDate, endDate, startTime, endTime])

  const toggleAvailability = (date: string, time: string) => {
    const key = `${date}_${time}`
    const newAvailability = {
      ...availability,
      [key]: !availability[key],
    }
    onAvailabilityChange(newAvailability)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="grid grid-cols-1 gap-4">
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
                const key = `${date}_${time}`
                const isSelected = availability[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggleAvailability(date, time)}
                    className={`w-24 h-8 border border-gray-200 transition-colors ${
                      isSelected ? "bg-green-500 hover:bg-green-600 text-white" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>Click on time slots to mark when you're available. Green = Available</p>
      </div>
    </div>
  )
}

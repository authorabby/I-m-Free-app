"use client"

import { useState, useEffect, useRef, useCallback } from "react"

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
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<"select" | "deselect">("select")
  const containerRef = useRef<HTMLDivElement>(null)

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

  const getSlotKey = (date: string, time: string) => `${date}_${time}`

  const handleMouseDown = useCallback(
    (date: string, time: string) => {
      const key = getSlotKey(date, time)
      const newMode = availability[key] ? "deselect" : "select"
      setDragMode(newMode)
      setIsDragging(true)

      const newAvailability = {
        ...availability,
        [key]: newMode === "select",
      }
      onAvailabilityChange(newAvailability)
    },
    [availability, onAvailabilityChange],
  )

  const handleMouseEnter = useCallback(
    (date: string, time: string) => {
      if (!isDragging) return

      const key = getSlotKey(date, time)
      const newAvailability = {
        ...availability,
        [key]: dragMode === "select",
      }
      onAvailabilityChange(newAvailability)
    },
    [isDragging, dragMode, availability, onAvailabilityChange],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    document.addEventListener("mouseup", handleGlobalMouseUp)
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto" ref={containerRef}>
        <div className="min-w-max">
          <div className="grid grid-cols-1 gap-2">
            {/* Header */}
            <div className="flex">
              <div className="w-20 flex-shrink-0"></div>
              {dates.map((date) => (
                <div key={date} className="w-24 text-center text-sm font-semibold text-gray-700 p-2">
                  {formatDate(date)}
                </div>
              ))}
            </div>

            {/* Time slots */}
            {timeSlots.map((time) => (
              <div key={time} className="flex items-center">
                <div className="w-20 flex-shrink-0 text-sm text-gray-600 pr-2 font-medium">{time}</div>
                {dates.map((date) => {
                  const key = getSlotKey(date, time)
                  const isSelected = availability[key]
                  return (
                    <div
                      key={key}
                      onMouseDown={() => handleMouseDown(date, time)}
                      onMouseEnter={() => handleMouseEnter(date, time)}
                      onMouseUp={handleMouseUp}
                      className={`w-24 h-10 border border-gray-200 transition-all duration-200 cursor-pointer select-none rounded-md mx-0.5 ${
                        isSelected
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 border-violet-500 shadow-md transform scale-105"
                          : "bg-white hover:bg-violet-50 hover:border-violet-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-violet-50 rounded-lg p-4 border border-violet-200">
        <p className="text-sm text-violet-700 font-medium">
          💡 <strong>Tip:</strong> Click and drag to select multiple time slots at once. Selected times will appear with
          a beautiful gradient.
        </p>
      </div>
    </div>
  )
}

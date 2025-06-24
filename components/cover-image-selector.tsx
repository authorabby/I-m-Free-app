"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageIcon, Palette, Calendar, Users, Coffee, Briefcase, Heart, Star, Search } from "lucide-react"
import { UnsplashImageSelector } from "./unsplash-image-selector"

interface CoverImageSelectorProps {
  value: string
  onChange: (value: string, attribution?: string) => void
}

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)",
]

const icons = [
  { icon: Calendar, color: "text-white" },
  { icon: Users, color: "text-white" },
  { icon: Coffee, color: "text-white" },
  { icon: Briefcase, color: "text-white" },
  { icon: Heart, color: "text-white" },
  { icon: Star, color: "text-white" },
]

export function CoverImageSelector({ value, onChange }: CoverImageSelectorProps) {
  const [selectedGradient, setSelectedGradient] = useState(gradients[0])
  const [selectedIcon, setSelectedIcon] = useState(0)

  const generateCoverImage = (gradient: string, iconIndex: number) => {
    const IconComponent = icons[iconIndex].icon
    const canvas = document.createElement("canvas")
    canvas.width = 400
    canvas.height = 200
    const ctx = canvas.getContext("2d")

    if (!ctx) return ""

    // Create gradient
    const grd = ctx.createLinearGradient(0, 0, 400, 200)
    // Parse gradient colors (simplified)
    if (gradient.includes("#667eea")) {
      grd.addColorStop(0, "#667eea")
      grd.addColorStop(1, "#764ba2")
    } else if (gradient.includes("#f093fb")) {
      grd.addColorStop(0, "#f093fb")
      grd.addColorStop(1, "#f5576c")
    } else if (gradient.includes("#4facfe")) {
      grd.addColorStop(0, "#4facfe")
      grd.addColorStop(1, "#00f2fe")
    } else if (gradient.includes("#43e97b")) {
      grd.addColorStop(0, "#43e97b")
      grd.addColorStop(1, "#38f9d7")
    } else if (gradient.includes("#fa709a")) {
      grd.addColorStop(0, "#fa709a")
      grd.addColorStop(1, "#fee140")
    } else if (gradient.includes("#a8edea")) {
      grd.addColorStop(0, "#a8edea")
      grd.addColorStop(1, "#fed6e3")
    } else if (gradient.includes("#ff9a9e")) {
      grd.addColorStop(0, "#ff9a9e")
      grd.addColorStop(1, "#fecfef")
    } else if (gradient.includes("#ffecd2")) {
      grd.addColorStop(0, "#ffecd2")
      grd.addColorStop(1, "#fcb69f")
    } else if (gradient.includes("#a18cd1")) {
      grd.addColorStop(0, "#a18cd1")
      grd.addColorStop(1, "#fbc2eb")
    } else {
      grd.addColorStop(0, "#fad0c4")
      grd.addColorStop(1, "#ffd1ff")
    }

    ctx.fillStyle = grd
    ctx.fillRect(0, 0, 400, 200)

    return canvas.toDataURL()
  }

  const handleGradientSelect = (gradient: string) => {
    setSelectedGradient(gradient)
    const dataUrl = generateCoverImage(gradient, selectedIcon)
    onChange(dataUrl)
  }

  const handleIconSelect = (iconIndex: number) => {
    setSelectedIcon(iconIndex)
    const dataUrl = generateCoverImage(selectedGradient, iconIndex)
    onChange(dataUrl)
  }

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative">
        {value ? (
          <div
            className="h-32 bg-cover bg-center rounded-lg border-2 border-gray-200"
            style={{ backgroundImage: `url(${value})` }}
          />
        ) : (
          <div className="h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Select a cover design</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs for different cover types */}
      <Tabs defaultValue="gradient" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="gradient" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Colors & Icons
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Photos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gradient" className="space-y-4 mt-4">
          {/* Gradient Options */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Choose Background
            </p>
            <div className="grid grid-cols-5 gap-2">
              {gradients.map((gradient, index) => (
                <button
                  key={index}
                  onClick={() => handleGradientSelect(gradient)}
                  className={`h-12 rounded-lg border-2 transition-all ${
                    selectedGradient === gradient
                      ? "border-violet-500 scale-105"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  style={{ background: gradient }}
                />
              ))}
            </div>
          </div>

          {/* Icon Options */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Choose Icon</p>
            <div className="grid grid-cols-6 gap-2">
              {icons.map((iconData, index) => {
                const IconComponent = iconData.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleIconSelect(index)}
                    className={`h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                      selectedIcon === index ? "border-violet-500 scale-105" : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ background: selectedGradient }}
                  >
                    <IconComponent className="w-5 h-5 text-white" />
                  </button>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="photos" className="mt-4">
          <UnsplashImageSelector value={value} onChange={onChange} />
        </TabsContent>
      </Tabs>

      <Button
        variant="outline"
        onClick={() => onChange("")}
        className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
      >
        Remove Cover Image
      </Button>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageIcon, Search, Loader2, RefreshCw } from "lucide-react"

interface UnsplashPhoto {
  id: string
  urls: {
    small: string
    regular: string
    full: string
  }
  alt_description: string
  user: {
    name: string
    username: string
  }
  links: {
    html: string
  }
}

interface UnsplashImageSelectorProps {
  value: string
  onChange: (value: string, attribution?: string) => void
}

// Note: In a real app, you'd use the Unsplash API with proper authentication
// For this demo, we'll use a mock service that simulates Unsplash
const mockUnsplashPhotos: UnsplashPhoto[] = [
  {
    id: "1",
    urls: {
      small: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
    },
    alt_description: "Team meeting in modern office",
    user: { name: "Annie Spratt", username: "anniespratt" },
    links: { html: "https://unsplash.com/@anniespratt" },
  },
  {
    id: "2",
    urls: {
      small: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    },
    alt_description: "People collaborating at work",
    user: { name: "Brooke Cagle", username: "brookecagle" },
    links: { html: "https://unsplash.com/@brookecagle" },
  },
  {
    id: "3",
    urls: {
      small: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
    },
    alt_description: "Coffee and planning session",
    user: { name: "Glenna Rankin", username: "glenna" },
    links: { html: "https://unsplash.com/@glenna" },
  },
  {
    id: "4",
    urls: {
      small: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4",
    },
    alt_description: "Business meeting discussion",
    user: { name: "Scott Graham", username: "homajob" },
    links: { html: "https://unsplash.com/@homajob" },
  },
  {
    id: "5",
    urls: {
      small: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1552664730-d307ca884978",
    },
    alt_description: "Team collaboration workspace",
    user: { name: "Headway", username: "headwayio" },
    links: { html: "https://unsplash.com/@headwayio" },
  },
  {
    id: "6",
    urls: {
      small: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1559136555-9303baea8ebd",
    },
    alt_description: "Laptop and coffee meeting",
    user: { name: "Laptop Mag", username: "laptopmag" },
    links: { html: "https://unsplash.com/@laptopmag" },
  },
  {
    id: "7",
    urls: {
      small: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
    },
    alt_description: "Professional handshake meeting",
    user: { name: "Sebastian Herrmann", username: "officestock" },
    links: { html: "https://unsplash.com/@officestock" },
  },
  {
    id: "8",
    urls: {
      small: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
    },
    alt_description: "Whiteboard brainstorming session",
    user: { name: "Alex Kotliarskyi", username: "frantic" },
    links: { html: "https://unsplash.com/@frantic" },
  },
]

const coffeePhotos: UnsplashPhoto[] = [
  {
    id: "c1",
    urls: {
      small: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    },
    alt_description: "Coffee cup on wooden table",
    user: { name: "Fahmi Fakhrudin", username: "fahmipaping" },
    links: { html: "https://unsplash.com/@fahmipaping" },
  },
  {
    id: "c2",
    urls: {
      small: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    },
    alt_description: "Coffee shop atmosphere",
    user: { name: "Nathan Dumlao", username: "nate_dumlao" },
    links: { html: "https://unsplash.com/@nate_dumlao" },
  },
  {
    id: "c3",
    urls: {
      small: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb",
    },
    alt_description: "Coffee and laptop workspace",
    user: { name: "Avel Chuklanov", username: "chuklanov" },
    links: { html: "https://unsplash.com/@chuklanov" },
  },
]

const teamPhotos: UnsplashPhoto[] = [
  {
    id: "t1",
    urls: {
      small: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    },
    alt_description: "Team putting hands together",
    user: { name: "Annie Spratt", username: "anniespratt" },
    links: { html: "https://unsplash.com/@anniespratt" },
  },
  {
    id: "t2",
    urls: {
      small: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
    },
    alt_description: "Team working together",
    user: { name: "Brooke Cagle", username: "brookecagle" },
    links: { html: "https://unsplash.com/@brookecagle" },
  },
]

export function UnsplashImageSelector({ value, onChange }: UnsplashImageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [photos, setPhotos] = useState<UnsplashPhoto[]>(mockUnsplashPhotos)
  const [loading, setLoading] = useState(false)
  const [selectedAttribution, setSelectedAttribution] = useState("")

  const handleSearch = async (query: string) => {
    setLoading(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock search results based on query
    let results: UnsplashPhoto[] = []

    if (query.toLowerCase().includes("coffee")) {
      results = [...coffeePhotos, ...mockUnsplashPhotos.slice(0, 3)]
    } else if (query.toLowerCase().includes("team")) {
      results = [...teamPhotos, ...mockUnsplashPhotos.slice(0, 4)]
    } else if (query.toLowerCase().includes("meeting")) {
      results = mockUnsplashPhotos.slice(0, 6)
    } else if (query.trim() === "") {
      results = mockUnsplashPhotos
    } else {
      // Random subset for other searches
      results = mockUnsplashPhotos.slice(0, 4)
    }

    setPhotos(results)
    setLoading(false)
  }

  const handlePhotoSelect = (photo: UnsplashPhoto) => {
    const attribution = `Photo by ${photo.user.name} on Unsplash`
    setSelectedAttribution(attribution)
    onChange(photo.urls.regular, attribution)
  }

  const handleRandomPhotos = () => {
    const shuffled = [...mockUnsplashPhotos].sort(() => 0.5 - Math.random())
    setPhotos(shuffled)
    setSearchQuery("")
  }

  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        handleSearch(searchQuery)
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setPhotos(mockUnsplashPhotos)
    }
  }, [searchQuery])

  return (
    <div className="space-y-4">
      {/* Preview */}
      <div className="relative">
        {value ? (
          <div className="relative">
            <div
              className="h-32 bg-cover bg-center rounded-lg border-2 border-gray-200"
              style={{ backgroundImage: `url(${value})` }}
            />
            {selectedAttribution && <p className="text-xs text-gray-500 mt-1">{selectedAttribution}</p>}
          </div>
        ) : (
          <div className="h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Search for a cover photo</p>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search for photos (e.g., coffee, team, meeting)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-gray-200 focus:border-violet-500 focus:ring-violet-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRandomPhotos}
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Random Photos
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("coffee")}
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Coffee
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("team")}
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Team
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery("meeting")}
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Meeting
        </Button>
      </div>

      {/* Photo Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-violet-600" />
          <span className="ml-2 text-gray-600">Searching photos...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <button
              key={photo.id}
              onClick={() => handlePhotoSelect(photo)}
              className={`relative group overflow-hidden rounded-lg border-2 transition-all hover:scale-105 ${
                value === photo.urls.regular
                  ? "border-violet-500 ring-2 ring-violet-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={photo.urls.small || "/placeholder.svg"}
                alt={photo.alt_description}
                className="w-full h-24 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
              <div className="absolute bottom-1 left-1 right-1">
                <p className="text-xs text-white bg-black/50 rounded px-1 py-0.5 truncate">by {photo.user.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Remove Photo Button */}
      {value && (
        <Button
          variant="outline"
          onClick={() => {
            onChange("", "")
            setSelectedAttribution("")
          }}
          className="w-full border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Remove Cover Photo
        </Button>
      )}

      {/* Unsplash Attribution */}
      <div className="text-xs text-gray-500 text-center">
        Photos provided by{" "}
        <a
          href="https://unsplash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-600 hover:underline"
        >
          Unsplash
        </a>
      </div>
    </div>
  )
}

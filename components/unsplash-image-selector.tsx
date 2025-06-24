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
  keywords?: string[]
}

interface UnsplashImageSelectorProps {
  value: string
  onChange: (value: string, attribution?: string) => void
}

// Expanded mock photo database with more categories and variety
const mockPhotoDatabase: UnsplashPhoto[] = [
  // Meeting & Business
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
    keywords: ["meeting", "business", "office", "team", "work", "professional"],
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
    keywords: ["collaboration", "work", "team", "business", "office", "meeting"],
  },
  // Coffee & Casual
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
    keywords: ["coffee", "cafe", "casual", "meeting", "drink", "table", "wood"],
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
    keywords: ["coffee", "shop", "cafe", "atmosphere", "casual", "meeting", "social"],
  },
  // Nature & Outdoor
  {
    id: "n1",
    urls: {
      small: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
    },
    alt_description: "Forest path in nature",
    user: { name: "Casey Horner", username: "mischievous_penguins" },
    links: { html: "https://unsplash.com/@mischievous_penguins" },
    keywords: ["nature", "forest", "outdoor", "trees", "path", "green", "peaceful"],
  },
  {
    id: "n2",
    urls: {
      small: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    },
    alt_description: "Mountain landscape view",
    user: { name: "Qingbao Meng", username: "qingbao" },
    links: { html: "https://unsplash.com/@qingbao" },
    keywords: ["mountain", "landscape", "nature", "outdoor", "view", "scenic", "adventure"],
  },
  // Technology & Modern
  {
    id: "t1",
    urls: {
      small: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1518709268805-4e9042af2176",
    },
    alt_description: "Modern laptop and workspace",
    user: { name: "Avel Chuklanov", username: "chuklanov" },
    links: { html: "https://unsplash.com/@chuklanov" },
    keywords: ["technology", "laptop", "modern", "workspace", "digital", "computer", "work"],
  },
  {
    id: "t2",
    urls: {
      small: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    },
    alt_description: "Data visualization on screens",
    user: { name: "Carlos Muza", username: "kmuza" },
    links: { html: "https://unsplash.com/@kmuza" },
    keywords: ["data", "analytics", "technology", "screens", "digital", "business", "modern"],
  },
  // Food & Social
  {
    id: "f1",
    urls: {
      small: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0",
    },
    alt_description: "Restaurant dining table setup",
    user: { name: "Jay Wennington", username: "jaywennington" },
    links: { html: "https://unsplash.com/@jaywennington" },
    keywords: ["food", "restaurant", "dining", "social", "meal", "table", "gathering"],
  },
  {
    id: "f2",
    urls: {
      small: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445",
    },
    alt_description: "Pancakes and breakfast spread",
    user: { name: "Brooke Lark", username: "brookelark" },
    links: { html: "https://unsplash.com/@brookelark" },
    keywords: ["food", "breakfast", "pancakes", "meal", "brunch", "social", "gathering"],
  },
  // Creative & Art
  {
    id: "a1",
    urls: {
      small: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0",
    },
    alt_description: "Art supplies and creative workspace",
    user: { name: "Russn_fckr", username: "russn_fckr" },
    links: { html: "https://unsplash.com/@russn_fckr" },
    keywords: ["art", "creative", "supplies", "workspace", "design", "artistic", "colorful"],
  },
  {
    id: "a2",
    urls: {
      small: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
    },
    alt_description: "Colorful paint palette",
    user: { name: "Zaksheuskaya", username: "zaksheuskaya" },
    links: { html: "https://unsplash.com/@zaksheuskaya" },
    keywords: ["paint", "color", "creative", "art", "palette", "artistic", "vibrant"],
  },
  // Sports & Activity
  {
    id: "s1",
    urls: {
      small: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
    },
    alt_description: "Basketball court and sports",
    user: { name: "Markus Spiske", username: "markusspiske" },
    links: { html: "https://unsplash.com/@markusspiske" },
    keywords: ["sports", "basketball", "activity", "game", "court", "athletic", "exercise"],
  },
  {
    id: "s2",
    urls: {
      small: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=400&h=200&fit=crop",
      regular: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=800&h=400&fit=crop",
      full: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643",
    },
    alt_description: "Person running on track",
    user: { name: "Braden Collum", username: "bradencollum" },
    links: { html: "https://unsplash.com/@bradencollum" },
    keywords: ["running", "track", "exercise", "fitness", "sports", "activity", "athletic"],
  },
]

const handleSearch = async (query: string, setLoading: any, setPhotos: any) => {
  setLoading(true)

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let results: UnsplashPhoto[] = []

  if (query.trim() === "") {
    // Show default mix when no search query
    results = mockPhotoDatabase.slice(0, 8)
  } else {
    // Search through all photos based on keywords and descriptions
    const searchTerms = query.toLowerCase().split(" ")

    results = mockPhotoDatabase.filter((photo) => {
      const searchableText = [photo.alt_description.toLowerCase(), ...(photo.keywords || [])].join(" ")

      return searchTerms.some((term) => searchableText.includes(term.toLowerCase()))
    })

    // If no matches found, show a random selection
    if (results.length === 0) {
      results = mockPhotoDatabase.slice(0, 6)
    }

    // Limit results to prevent overwhelming UI
    results = results.slice(0, 12)
  }

  setPhotos(results)
  setLoading(false)
}

export function UnsplashImageSelector({ value, onChange }: UnsplashImageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [photos, setPhotos] = useState<UnsplashPhoto[]>(mockPhotoDatabase.slice(0, 8))
  const [loading, setLoading] = useState(false)
  const [selectedAttribution, setSelectedAttribution] = useState("")

  const handlePhotoSelect = (photo: UnsplashPhoto) => {
    const attribution = `Photo by ${photo.user.name} on Unsplash`
    setSelectedAttribution(attribution)
    onChange(photo.urls.regular, attribution)
  }

  const handleRandomPhotos = () => {
    const shuffled = [...mockPhotoDatabase].sort(() => 0.5 - Math.random())
    setPhotos(shuffled)
    setSearchQuery("")
  }

  useEffect(() => {
    if (searchQuery) {
      const debounceTimer = setTimeout(() => {
        handleSearch(searchQuery, setLoading, setPhotos)
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setPhotos(mockPhotoDatabase.slice(0, 8))
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

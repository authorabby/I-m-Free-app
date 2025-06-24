"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Users, Calendar } from "lucide-react"

interface TestUser {
  username: string
  password: string
  name: string
  description: string
}

const testUsers: TestUser[] = [
  {
    username: "alice",
    password: "demo123",
    name: "Alice Johnson",
    description: "Team Lead - Has created several events and participates in others",
  },
  {
    username: "bob",
    password: "demo123",
    name: "Bob Smith",
    description: "Developer - Participates in team events and has some scheduling conflicts",
  },
  {
    username: "carol",
    password: "demo123",
    name: "Carol Davis",
    description: "Designer - Active participant with flexible availability",
  },
  {
    username: "david",
    password: "demo123",
    name: "David Wilson",
    description: "Manager - Creates company-wide events and has limited availability",
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLogin, setIsLogin] = useState(true)

  useEffect(() => {
    // Initialize test data if not already present
    initializeTestData()
  }, [])

  const initializeTestData = () => {
    // Check if test data already exists
    if (localStorage.getItem("testDataInitialized")) return

    // Create test users
    const users = {
      alice: { password: "demo123", name: "Alice Johnson" },
      bob: { password: "demo123", name: "Bob Smith" },
      carol: { password: "demo123", name: "Carol Davis" },
      david: { password: "demo123", name: "David Wilson" },
    }
    localStorage.setItem("users", JSON.stringify(users))

    // Create sample events
    const sampleEvents = [
      {
        id: "event_sample1",
        title: "Team Planning Meeting",
        startDate: "2025-01-06",
        endDate: "2025-01-08",
        startTime: "09:00",
        endTime: "17:00",
        creator: "Alice Johnson",
        coverImage: "",
        participants: [
          {
            name: "Alice Johnson",
            availability: {
              "2025-01-06_09:00": true,
              "2025-01-06_09:30": true,
              "2025-01-06_10:00": true,
              "2025-01-07_14:00": true,
              "2025-01-07_14:30": true,
              "2025-01-07_15:00": true,
              "2025-01-08_10:00": true,
              "2025-01-08_10:30": true,
            },
          },
          {
            name: "Bob Smith",
            availability: {
              "2025-01-06_10:00": true,
              "2025-01-06_10:30": true,
              "2025-01-06_11:00": true,
              "2025-01-07_14:00": true,
              "2025-01-07_14:30": true,
              "2025-01-08_09:00": true,
              "2025-01-08_09:30": true,
              "2025-01-08_10:00": true,
            },
          },
          {
            name: "Carol Davis",
            availability: {
              "2025-01-06_09:30": true,
              "2025-01-06_10:00": true,
              "2025-01-06_10:30": true,
              "2025-01-07_13:30": true,
              "2025-01-07_14:00": true,
              "2025-01-07_14:30": true,
              "2025-01-07_15:00": true,
              "2025-01-08_10:00": true,
              "2025-01-08_10:30": true,
              "2025-01-08_11:00": true,
            },
          },
        ],
        createdAt: "2024-12-20T10:00:00.000Z",
      },
      {
        id: "event_sample2",
        title: "Coffee Chat & Brainstorm",
        startDate: "2025-01-10",
        endDate: "2025-01-10",
        startTime: "14:00",
        endTime: "18:00",
        creator: "David Wilson",
        coverImage: "",
        participants: [
          {
            name: "David Wilson",
            availability: {
              "2025-01-10_15:00": true,
              "2025-01-10_15:30": true,
              "2025-01-10_16:00": true,
            },
          },
          {
            name: "Carol Davis",
            availability: {
              "2025-01-10_14:30": true,
              "2025-01-10_15:00": true,
              "2025-01-10_15:30": true,
              "2025-01-10_16:00": true,
              "2025-01-10_16:30": true,
            },
          },
        ],
        createdAt: "2024-12-21T14:00:00.000Z",
      },
      {
        id: "event_sample3",
        title: "Project Review Session",
        startDate: "2025-01-13",
        endDate: "2025-01-15",
        startTime: "10:00",
        endTime: "16:00",
        creator: "Bob Smith",
        coverImage: "",
        participants: [
          {
            name: "Bob Smith",
            availability: {
              "2025-01-13_10:00": true,
              "2025-01-13_10:30": true,
              "2025-01-13_11:00": true,
              "2025-01-14_13:00": true,
              "2025-01-14_13:30": true,
              "2025-01-14_14:00": true,
              "2025-01-15_11:00": true,
              "2025-01-15_11:30": true,
            },
          },
          {
            name: "Alice Johnson",
            availability: {
              "2025-01-13_11:00": true,
              "2025-01-13_11:30": true,
              "2025-01-14_13:00": true,
              "2025-01-14_13:30": true,
              "2025-01-14_14:00": true,
              "2025-01-14_14:30": true,
              "2025-01-15_10:30": true,
              "2025-01-15_11:00": true,
              "2025-01-15_11:30": true,
            },
          },
          {
            name: "David Wilson",
            availability: {
              "2025-01-14_13:30": true,
              "2025-01-14_14:00": true,
              "2025-01-15_11:00": true,
              "2025-01-15_11:30": true,
              "2025-01-15_12:00": true,
            },
          },
        ],
        createdAt: "2024-12-22T09:00:00.000Z",
      },
    ]

    // Store sample events
    sampleEvents.forEach((event) => {
      localStorage.setItem(event.id, JSON.stringify(event))
    })

    // Create user event associations
    const userEvents = {
      alice: [
        { eventId: "sample1", role: "creator", participantName: "Alice Johnson" },
        { eventId: "sample3", role: "participant", participantName: "Alice Johnson" },
      ],
      bob: [
        { eventId: "sample1", role: "participant", participantName: "Bob Smith" },
        { eventId: "sample3", role: "creator", participantName: "Bob Smith" },
      ],
      carol: [
        { eventId: "sample1", role: "participant", participantName: "Carol Davis" },
        { eventId: "sample2", role: "participant", participantName: "Carol Davis" },
      ],
      david: [
        { eventId: "sample2", role: "creator", participantName: "David Wilson" },
        { eventId: "sample3", role: "participant", participantName: "David Wilson" },
      ],
    }

    Object.entries(userEvents).forEach(([username, events]) => {
      localStorage.setItem(`userEvents_${username}`, JSON.stringify(events))
    })

    localStorage.setItem("testDataInitialized", "true")
  }

  const handleLogin = () => {
    const users = JSON.parse(localStorage.getItem("users") || "{}")

    if (users[username] && users[username].password === password) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username,
          name: users[username].name,
        }),
      )
      router.push("/")
    } else {
      alert("Invalid username or password")
    }
  }

  const handleSignup = () => {
    if (!username || !password || !name) {
      alert("Please fill in all fields")
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "{}")

    if (users[username]) {
      alert("Username already exists")
      return
    }

    users[username] = { password, name }
    localStorage.setItem("users", JSON.stringify(users))

    // Initialize empty user events
    localStorage.setItem(`userEvents_${username}`, JSON.stringify([]))

    localStorage.setItem("currentUser", JSON.stringify({ username, name }))
    router.push("/")
  }

  const handleTestLogin = (testUser: TestUser) => {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        username: testUser.username,
        name: testUser.name,
      }),
    )
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              I'm Free
            </h1>
          </div>
          <p className="text-xl text-gray-600 font-medium">Sign in to manage your scheduling events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login/Signup Form */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Account Access</CardTitle>
              <CardDescription className="text-violet-100">Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <Button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  >
                    Sign In
                  </Button>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Choose a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-gray-200 focus:border-violet-500 focus:ring-violet-500"
                    />
                  </div>
                  <Button
                    onClick={handleSignup}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                  >
                    Create Account
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Test Accounts */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="w-5 h-5" />
                Demo Accounts
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Try the app with pre-populated test accounts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {testUsers.map((user) => (
                <div key={user.username} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.description}</p>
                    </div>
                    <Button
                      onClick={() => handleTestLogin(user)}
                      size="sm"
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                    >
                      Login as {user.name.split(" ")[0]}
                    </Button>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      Username: {user.username}
                    </Badge>
                    <Badge variant="outline" className="border-gray-300 text-gray-600">
                      Password: {user.password}
                    </Badge>
                  </div>
                </div>
              ))}

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">What's Included</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Multiple events with different participants</li>
                      <li>• Various availability patterns to test the heat map</li>
                      <li>• Creator and participant role examples</li>
                      <li>• Realistic scheduling scenarios</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

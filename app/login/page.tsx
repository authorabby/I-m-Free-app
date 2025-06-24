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

// This defines what information we store about each test user
interface TestUser {
  username: string
  password: string
  name: string
  description: string
}

// These are our demo accounts that people can try out
// They have pre-made events and schedules to show how the app works
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

// This is the main login page component
// It lets users sign in, sign up, or try demo accounts
export default function LoginPage() {
  const router = useRouter() // This helps us move between pages

  // These variables store what the user types in the form
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("") // New: store user's email address
  const [isLogin, setIsLogin] = useState(true) // true = login form, false = signup form

  // This runs when the page first loads
  // It sets up all the demo data so people can try the app
  useEffect(() => {
    initializeTestData()
  }, [])

  // This function creates all the sample events and users for the demo
  const initializeTestData = () => {
    // Check if we already set up the demo data
    if (localStorage.getItem("testDataInitialized")) return

    // Create the demo user accounts with their passwords and email addresses
    const users = {
      alice: { password: "demo123", name: "Alice Johnson", email: "alice@example.com" },
      bob: { password: "demo123", name: "Bob Smith", email: "bob@example.com" },
      carol: { password: "demo123", name: "Carol Davis", email: "carol@example.com" },
      david: { password: "demo123", name: "David Wilson", email: "david@example.com" },
    }
    localStorage.setItem("users", JSON.stringify(users))

    // Create some sample events that show how the app works
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
            email: "alice@example.com",
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
            email: "bob@example.com",
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
            email: "carol@example.com",
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
            email: "david@example.com",
            availability: {
              "2025-01-10_15:00": true,
              "2025-01-10_15:30": true,
              "2025-01-10_16:00": true,
            },
          },
          {
            name: "Carol Davis",
            email: "carol@example.com",
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
            email: "bob@example.com",
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
            email: "alice@example.com",
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
            email: "david@example.com",
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

    // Save all the sample events to the browser's storage
    sampleEvents.forEach((event) => {
      localStorage.setItem(event.id, JSON.stringify(event))
    })

    // Connect users to their events (who created what, who joined what)
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

    // Save the user-event connections
    Object.entries(userEvents).forEach(([username, events]) => {
      localStorage.setItem(`userEvents_${username}`, JSON.stringify(events))
    })

    // Mark that we've set up all the demo data
    localStorage.setItem("testDataInitialized", "true")
  }

  // This function runs when someone tries to log in
  const handleLogin = () => {
    // Get all the user accounts from storage
    const users = JSON.parse(localStorage.getItem("users") || "{}")

    // Check if the username and password match
    if (users[username] && users[username].password === password) {
      // Save who is currently logged in
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          username,
          name: users[username].name,
          email: users[username].email,
        }),
      )
      // Go to the main page
      router.push("/")
    } else {
      // Show error if login failed
      alert("Invalid username or password")
    }
  }

  // This function runs when someone creates a new account
  const handleSignup = () => {
    // Make sure all fields are filled out
    if (!username || !password || !name || !email) {
      alert("Please fill in all fields")
      return
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "{}")

    // Check if username is already taken
    if (users[username]) {
      alert("Username already exists")
      return
    }

    // Add the new user
    users[username] = { password, name, email }
    localStorage.setItem("users", JSON.stringify(users))

    // Create empty event list for new user
    localStorage.setItem(`userEvents_${username}`, JSON.stringify([]))

    // Log them in automatically
    localStorage.setItem("currentUser", JSON.stringify({ username, name, email }))
    router.push("/")
  }

  // This function logs someone in as a demo user
  const handleTestLogin = (testUser: TestUser) => {
    const users = JSON.parse(localStorage.getItem("users") || "{}")
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        username: testUser.username,
        name: testUser.name,
        email: users[testUser.username]?.email || `${testUser.username}@example.com`,
      }),
    )
    router.push("/")
  }

  // This is what shows up on the screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* App title and description */}
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
          {/* Login and Signup Forms */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="text-xl">Account Access</CardTitle>
              <CardDescription className="text-violet-100">Sign in to your account or create a new one</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* Tabs to switch between login and signup */}
              <Tabs value={isLogin ? "login" : "signup"} onValueChange={(value) => setIsLogin(value === "login")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login form */}
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

                {/* Signup form */}
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
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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

          {/* Demo Accounts Section */}
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
              {/* Show each demo user */}
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
                  {/* Show the login details */}
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

              {/* Information about what's included in the demo */}
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

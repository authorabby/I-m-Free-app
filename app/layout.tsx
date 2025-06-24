import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: "I'm Free - Beautiful Scheduling",
  description: "Find the perfect time when everyone's available",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans">
        <ThemeProvider defaultTheme="light" storageKey="im-free-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}

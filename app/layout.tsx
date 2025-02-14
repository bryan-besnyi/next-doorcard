import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/AuthProvider"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Faculty Doorcard App",
  description: "Create and manage faculty doorcards",
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background`}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</main>
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}


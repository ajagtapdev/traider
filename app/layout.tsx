import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ConvexClientProvider } from "./ConvexClientProvider";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "traider",
  description: "learn your trades with AI",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/chart.js/3.7.0/chart.min.css"
            integrity="sha512-TxZbN7EFJFyV+85pMMyNGcTgY9ukjgtBQi+7DZZyYf/8AxACd+5Qw+9lR8bsLdOBxIpKA2UviPj9iUwD91JbAA=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </head>
        <body
          className={cn(
            inter.className,
            "min-h-screen bg-gradient-to-br from-[#F8F4E3] to-[#E8E1C8] text-gray-800 antialiased",
          )}
        >
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}


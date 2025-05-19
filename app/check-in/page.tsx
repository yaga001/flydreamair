"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plane, User, LogOut, Settings, Bell, Calendar, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCurrentUser, signOutUser } from "@/lib/auth"
import { getUserBookings } from "@/lib/bookings"
import type { UserType, BookingType } from "@/lib/types"

export default function CheckInPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [loading, setLoading] = useState(true)
  const [referenceNumber, setReferenceNumber] = useState("")
  const [lastName, setLastName] = useState("")
  const [searchError, setSearchError] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const userBookings = await getUserBookings(currentUser.id)
          // Filter only upcoming bookings eligible for check-in (within 24 hours of departure)
          const eligibleBookings = userBookings.filter((booking) => {
            const departureDate = new Date(booking.departureDate)
            const now = new Date()
            const timeDiff = departureDate.getTime() - now.getTime()
            const hoursDiff = timeDiff / (1000 * 3600)
            return hoursDiff <= 24 && hoursDiff > 0
          })
          setBookings(eligibleBookings)
        } else {
          router.push("/auth/signin")
        }
      } catch (error) {
        router.push("/auth/signin")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleSignOut = async () => {
    await signOutUser()
    router.push("/")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError("")
    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      setIsSearching(false)
      setSearchError("No booking found with the provided details. Please check and try again.")
    }, 1500)
  }

  const handleCheckIn = (bookingId: string) => {
    // In a real app, this would call an API to process check-in
    alert(`Check-in successful for booking ${bookingId}!`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Plane className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">FlyDreamAir</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-100 text-blue-600">{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium hidden md:inline-block">
                    {user.firstName} {user.lastName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center text-red-600" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Online Check-in</h1>
          <p className="text-blue-100">Check in for your upcoming flights</p>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-[2fr_1fr] gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Check-in for Your Flight</CardTitle>
                  <CardDescription>
                    Check-in is available from 24 hours up to 2 hours before your scheduled departure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="referenceNumber">Booking Reference</Label>
                      <Input
                        id="referenceNumber"
                        placeholder="e.g. FD123456"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                    {searchError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md">{searchError}</div>}
                    <Button type="submit" className="w-full" disabled={isSearching}>
                      {isSearching ? "Searching..." : "Find Booking"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Eligible Flights</CardTitle>
                  <CardDescription>
                    The following flights are eligible for check-in. Check-in opens 24 hours before departure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {bookings.length > 0 ? (
                    <div className="space-y-6">
                      {bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4"
                        >
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Plane className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {booking.origin} to {booking.destination}
                              </div>
                              <div className="text-sm text-gray-500">
                                Flight {booking.flightNumber} •{" "}
                                {new Date(booking.departureDate).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}{" "}
                                • {booking.departureTime}
                              </div>
                            </div>
                          </div>
                          <Button className="flex items-center" onClick={() => handleCheckIn(booking.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Check-in Now</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-8 w-8 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No eligible flights</h3>
                      <p className="text-gray-500 mb-6">
                        You don't have any flights eligible for check-in at this time. Check-in opens 24 hours before
                        departure.
                      </p>
                      <Button asChild>
                        <Link href="/my-bookings">View My Bookings</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Check-in Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Check-in Options</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                          1
                        </span>
                        <span>Online check-in: Available 24 hours before departure</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                          2
                        </span>
                        <span>Mobile app check-in: Download our app for the fastest experience</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                          3
                        </span>
                        <span>Airport kiosk: Available at all major airports</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                          4
                        </span>
                        <span>Check-in counter: Available up to 2 hours before departure</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Required Documents</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Valid passport or ID for domestic flights</li>
                      <li>• Visa (if applicable)</li>
                      <li>• Booking reference number</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Baggage Information</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Check your baggage allowance on your booking confirmation or e-ticket.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="#">Baggage Policy</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FlyDreamAir. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

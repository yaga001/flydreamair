"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plane, Calendar, Clock, Download, Printer, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getCurrentUser, signOutUser } from "@/lib/auth"
import { getUserBookings } from "@/lib/bookings"
import { saveSearchHistory } from "@/lib/search-history"
import VirtualTicket from "@/components/virtual-ticket"
import type { UserType, BookingType } from "@/lib/types"
import MainLayout from "@/components/main-layout"

export default function MyBookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [bookings, setBookings] = useState<BookingType[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingType | null>(null)
  const [isRebooking, setIsRebooking] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const userBookings = await getUserBookings(currentUser.id)
          setBookings(userBookings)
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

  const handleBookAgain = async (booking: BookingType) => {
    if (!user) return

    setIsRebooking(true)

    try {
      // Save search to history
      await saveSearchHistory(user.id, {
        origin: booking.origin,
        destination: booking.destination,
        departDate: new Date().toISOString(), // Use current date as we don't have the original search date
        passengers: booking.passengers.length.toString(),
        cabinClass: "economy", // Default to economy as we don't have the original cabin class
        tripType: "oneway",
      })

      // Build query params
      const params = new URLSearchParams({
        origin: booking.origin,
        destination: booking.destination,
        departDate: new Date().toISOString(),
        passengers: booking.passengers.length.toString(),
        cabinClass: "economy",
        tripType: "oneway",
      })

      // Navigate to results page
      router.push(`/flights?${params.toString()}`)
    } catch (error) {
      console.error("Error rebooking flight:", error)
    } finally {
      setIsRebooking(false)
    }
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

  // Filter bookings by status
  const upcomingBookings = bookings.filter(
    (booking) => booking.status === "confirmed" && new Date(booking.departureDate) > new Date(),
  )
  const pastBookings = bookings.filter(
    (booking) => booking.status === "completed" || new Date(booking.departureDate) <= new Date(),
  )

  return (
    <MainLayout user={user} onSignOut={handleSignOut} currentPath="/my-bookings">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-blue-100">View and manage your flight bookings</p>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="upcoming" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>Upcoming Flights</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Past Flights</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingBookings.length > 0 ? (
                <div className="space-y-6">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <Plane className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">FlyDreamAir</div>
                              <div className="text-sm text-gray-500">Flight {booking.flightNumber}</div>
                            </div>
                          </div>
                          <Badge className="bg-green-500 hover:bg-green-600">Confirmed</Badge>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                          <div>
                            <div className="text-sm text-gray-500">From</div>
                            <div className="font-medium">{booking.origin}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">To</div>
                            <div className="font-medium">{booking.destination}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Date</div>
                            <div className="font-medium">
                              {new Date(booking.departureDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Time</div>
                            <div className="font-medium">{booking.departureTime}</div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex items-center"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Plane className="mr-2 h-4 w-4" />
                                <span>View Ticket</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Your E-Ticket</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="mt-4">
                                  <VirtualTicket booking={selectedBooking} />
                                  <div className="flex justify-end mt-4 space-x-2">
                                    <Button variant="outline" className="flex items-center">
                                      <Download className="mr-2 h-4 w-4" />
                                      <span>Download</span>
                                    </Button>
                                    <Button variant="outline" className="flex items-center">
                                      <Printer className="mr-2 h-4 w-4" />
                                      <span>Print</span>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button className="flex items-center">
                            <span>Check-in Online</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Plane className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No upcoming bookings</h3>
                    <p className="text-gray-500 mb-6">
                      You don't have any upcoming flights. Ready to plan your next trip?
                    </p>
                    <Button asChild>
                      <Link href="/dashboard">Search Flights</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastBookings.length > 0 ? (
                <div className="space-y-6">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                          <div className="flex items-center mb-4 md:mb-0">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                              <Plane className="h-6 w-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium">FlyDreamAir</div>
                              <div className="text-sm text-gray-500">Flight {booking.flightNumber}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-gray-300 text-gray-600">
                            Completed
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6">
                          <div>
                            <div className="text-sm text-gray-500">From</div>
                            <div className="font-medium">{booking.origin}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">To</div>
                            <div className="font-medium">{booking.destination}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Date</div>
                            <div className="font-medium">
                              {new Date(booking.departureDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Time</div>
                            <div className="font-medium">{booking.departureTime}</div>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex items-center"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Plane className="mr-2 h-4 w-4" />
                                <span>View Receipt</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Your Receipt</DialogTitle>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="mt-4">
                                  <VirtualTicket booking={selectedBooking} />
                                  <div className="flex justify-end mt-4 space-x-2">
                                    <Button variant="outline" className="flex items-center">
                                      <Download className="mr-2 h-4 w-4" />
                                      <span>Download</span>
                                    </Button>
                                    <Button variant="outline" className="flex items-center">
                                      <Printer className="mr-2 h-4 w-4" />
                                      <span>Print</span>
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            className="flex items-center"
                            onClick={() => handleBookAgain(booking)}
                            disabled={isRebooking}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>{isRebooking ? "Processing..." : "Book Again"}</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No past bookings</h3>
                    <p className="text-gray-500 mb-6">You haven't taken any flights with us yet.</p>
                    <Button asChild>
                      <Link href="/dashboard">Book Your First Flight</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </MainLayout>
  )
}

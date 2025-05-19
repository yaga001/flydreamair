"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Plane, ArrowRight, Clock, Luggage, Filter, SortAsc } from "lucide-react"
import { format } from "date-fns"
import { mockFlights } from "@/lib/mock-data"
import { getCurrentUser, signOutUser } from "@/lib/auth"
import type { UserType } from "@/lib/types"
import { useRouter } from "next/navigation"
import MainLayout from "@/components/main-layout"

export default function FlightsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [flights, setFlights] = useState<any[]>([])
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null)
  const [user, setUser] = useState<UserType | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const departDate = searchParams.get("departDate")
  const returnDate = searchParams.get("returnDate")
  const passengers = searchParams.get("passengers") || "1"
  const cabinClass = searchParams.get("cabinClass") || "economy"
  const tripType = searchParams.get("tripType") || "roundtrip"

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        } else {
          router.push("/auth/signin")
        }
      } catch (error) {
        router.push("/auth/signin")
      } finally {
        setAuthChecking(false)
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    if (!authChecking) {
      // Simulate API call
      const timer = setTimeout(() => {
        setFlights(mockFlights)
        setLoading(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [authChecking])

  const handleSelectFlight = (flightId: string) => {
    setSelectedFlight(flightId)
  }

  const handleContinue = () => {
    if (!selectedFlight) return

    const params = new URLSearchParams({
      flightId: selectedFlight,
      passengers,
      cabinClass,
    })

    router.push(`/seats?${params.toString()}`)
  }

  const handleSignOut = async () => {
    await signOutUser()
    router.push("/")
  }

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!origin || !destination || !departDate) {
    return (
      <MainLayout user={user} onSignOut={handleSignOut} currentPath="/flights">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Search Parameters</h1>
          <p className="mb-6">Please return to the dashboard and try again.</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={user} onSignOut={handleSignOut} currentPath="/flights">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Flight Results</h1>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{origin}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">{destination}</span>
                <span className="text-sm text-white/80">• {format(new Date(departDate), "MMM d, yyyy")}</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                Modify Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Button variant="outline" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <span>Filter</span>
            </Button>
            <Button variant="outline" className="flex items-center">
              <SortAsc className="mr-2 h-4 w-4" />
              <span>Sort by: Price</span>
            </Button>
          </div>

          <div className="grid md:grid-cols-[1fr_300px] gap-6">
            <div className="space-y-4">
              {loading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex-1 space-y-4">
                                <Skeleton className="h-8 w-32" />
                                <div className="flex items-center space-x-4">
                                  <Skeleton className="h-6 w-24" />
                                  <Skeleton className="h-6 w-24" />
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0">
                                <Skeleton className="h-10 w-28" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                : flights.map((flight) => (
                    <Card
                      key={flight.id}
                      className={`overflow-hidden cursor-pointer transition-all ${
                        selectedFlight === flight.id ? "ring-2 ring-blue-600" : ""
                      }`}
                      onClick={() => handleSelectFlight(flight.id)}
                    >
                      <CardContent className="p-0">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                              <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Plane className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">FlyDreamAir</div>
                                  <div className="text-sm text-gray-500">Flight {flight.flightNumber}</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-6">
                                <div>
                                  <div className="text-2xl font-bold">{flight.departureTime}</div>
                                  <div className="text-sm text-gray-500">{flight.origin}</div>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div className="text-xs text-gray-500">{flight.duration}</div>
                                  <div className="relative w-24 h-px bg-gray-300 my-2">
                                    <div className="absolute top-1/2 left-0 w-2 h-2 -mt-1 rounded-full bg-blue-600"></div>
                                    <div className="absolute top-1/2 right-0 w-2 h-2 -mt-1 rounded-full bg-blue-600"></div>
                                  </div>
                                  <div className="text-xs text-gray-500">Direct</div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold">{flight.arrivalTime}</div>
                                  <div className="text-sm text-gray-500">{flight.destination}</div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 md:mt-0 md:text-right">
                              <div className="text-2xl font-bold text-blue-600">${flight.price}</div>
                              <div className="text-sm text-gray-500">per passenger</div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="px-6 py-3 bg-gray-50 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-1" />
                              {flight.duration}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Luggage className="h-4 w-4 mr-1" />
                              {cabinClass === "economy" ? "1 bag" : "2 bags"}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-blue-600">Flight details</div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Trip Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div>
                      <div className="text-sm text-gray-500">From</div>
                      <div className="font-medium">{origin}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">To</div>
                      <div className="font-medium">{destination}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Depart</div>
                      <div className="font-medium">
                        {departDate ? format(new Date(departDate), "EEEE, MMMM d, yyyy") : ""}
                      </div>
                    </div>
                    {returnDate && (
                      <div>
                        <div className="text-sm text-gray-500">Return</div>
                        <div className="font-medium">{format(new Date(returnDate), "EEEE, MMMM d, yyyy")}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm text-gray-500">Passengers</div>
                      <div className="font-medium">
                        {passengers} {Number.parseInt(passengers) === 1 ? "passenger" : "passengers"}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cabin Class</div>
                      <div className="font-medium capitalize">{cabinClass}</div>
                    </div>
                  </div>

                  {selectedFlight && (
                    <>
                      <Separator className="my-4" />

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between">
                          <div className="text-sm">Flight</div>
                          <div className="font-medium">${flights.find((f) => f.id === selectedFlight)?.price || 0}</div>
                        </div>
                        <div className="flex justify-between">
                          <div className="text-sm">Taxes & Fees</div>
                          <div className="font-medium">$45.00</div>
                        </div>
                        <div className="flex justify-between text-lg font-bold">
                          <div>Total</div>
                          <div>${((flights.find((f) => f.id === selectedFlight)?.price || 0) + 45).toFixed(2)}</div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button className="w-full" size="lg" disabled={!selectedFlight} onClick={handleContinue}>
                    Continue to Seat Selection
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}

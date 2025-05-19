"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plane, ArrowRight, User } from "lucide-react"
import { mockFlights, mockSeatMap } from "@/lib/mock-data"
import { getCurrentUser, signOutUser } from "@/lib/auth"
import type { UserType } from "@/lib/types"
import MainLayout from "@/components/main-layout"

export default function SeatsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [user, setUser] = useState<UserType | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  const flightId = searchParams.get("flightId")
  const passengers = Number.parseInt(searchParams.get("passengers") || "1")
  const cabinClass = searchParams.get("cabinClass") || "economy"

  const flight = mockFlights.find((f) => f.id === flightId)
  const seatMap = mockSeatMap

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
    // Reset selected seats if passenger count changes
    setSelectedSeats([])
  }, [passengers])

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

  if (!flight) {
    return (
      <MainLayout user={user} onSignOut={handleSignOut} currentPath="/seats">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Flight Not Found</h1>
          <p className="mb-6">Please return to the flight search and try again.</p>
          <Button asChild>
            <Link href="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </MainLayout>
    )
  }

  const handleSeatSelect = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId))
    } else {
      if (selectedSeats.length < passengers) {
        setSelectedSeats([...selectedSeats, seatId])
      } else {
        // Replace the first selected seat if we've reached the limit
        const newSelected = [...selectedSeats]
        newSelected.shift()
        setSelectedSeats([...newSelected, seatId])
      }
    }
  }

  const isSeatAvailable = (seat: any) => {
    return (
      seat.status === "available" &&
      (cabinClass === "economy"
        ? seat.class === "economy"
        : cabinClass === "premium"
          ? seat.class === "premium"
          : cabinClass === "business"
            ? seat.class === "business"
            : seat.class === "first")
    )
  }

  const isSeatSelected = (seatId: string) => {
    return selectedSeats.includes(seatId)
  }

  const getSeatPrice = (seatClass: string) => {
    switch (seatClass) {
      case "economy":
        return 0
      case "premium":
        return 35
      case "business":
        return 120
      case "first":
        return 250
      default:
        return 0
    }
  }

  const getTotalPrice = () => {
    const baseFare = flight.price
    const taxes = 45

    const seatPrices = selectedSeats.reduce((total, seatId) => {
      const seat = seatMap.seats.find((s) => s.id === seatId)
      return total + (seat ? getSeatPrice(seat.class) : 0)
    }, 0)

    return (baseFare + taxes + seatPrices) * passengers
  }

  const handleContinue = () => {
    if (selectedSeats.length !== passengers) {
      alert(`Please select ${passengers} seats to continue.`)
      return
    }

    const params = new URLSearchParams({
      flightId: flightId || "",
      seats: selectedSeats.join(","),
      totalPrice: getTotalPrice().toString(),
    })

    router.push(`/confirmation?${params.toString()}`)
  }

  return (
    <MainLayout user={user} onSignOut={handleSignOut} currentPath="/seats">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Select Your Seats</h1>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{flight.origin}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">{flight.destination}</span>
                <span className="text-sm text-white/80">• Flight {flight.flightNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-[1fr_300px] gap-6">
            <div>
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Seat Map</h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Please select {passengers} {passengers === 1 ? "seat" : "seats"} from the available options below.
                    </p>

                    <div className="flex items-center justify-center space-x-6 mb-6">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-200 rounded mr-2"></div>
                        <span className="text-sm">Available</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-600 rounded mr-2"></div>
                        <span className="text-sm">Selected</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-400 rounded mr-2"></div>
                        <span className="text-sm">Occupied</span>
                      </div>
                    </div>

                    <div className="flex justify-center mb-8">
                      <div className="w-full max-w-md">
                        <div className="bg-gray-100 p-4 rounded-lg text-center mb-6">
                          <Plane className="h-8 w-8 mx-auto mb-2" />
                          <div className="text-sm font-medium">Front of Aircraft</div>
                        </div>

                        <div className="grid grid-cols-[auto_1fr_auto] gap-2">
                          {/* Row labels */}
                          <div className="flex flex-col items-center justify-center space-y-2">
                            {Array.from({ length: seatMap.rows }, (_, i) => (
                              <div
                                key={`row-${i + 1}`}
                                className="h-10 w-6 flex items-center justify-center text-sm font-medium"
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>

                          {/* Seat grid */}
                          <div className="grid grid-cols-6 gap-2">
                            {seatMap.seats.map((seat) => {
                              const isAvailable = isSeatAvailable(seat)
                              const isSelected = isSeatSelected(seat.id)

                              return (
                                <button
                                  key={seat.id}
                                  className={`h-10 rounded flex items-center justify-center text-sm font-medium transition-colors ${
                                    isAvailable
                                      ? isSelected
                                        ? "bg-blue-600 text-white hover:bg-blue-700"
                                        : "bg-gray-200 hover:bg-gray-300"
                                      : "bg-gray-400 cursor-not-allowed"
                                  } ${
                                    seat.class === "premium"
                                      ? "ring-1 ring-yellow-500"
                                      : seat.class === "business"
                                        ? "ring-1 ring-blue-500"
                                        : seat.class === "first"
                                          ? "ring-1 ring-purple-500"
                                          : ""
                                  }`}
                                  onClick={() => isAvailable && handleSeatSelect(seat.id)}
                                  disabled={!isAvailable}
                                >
                                  {seat.id.slice(-1)}
                                </button>
                              )
                            })}
                          </div>

                          {/* Column labels */}
                          <div className="flex flex-col items-center justify-start pt-2">
                            <div className="grid grid-cols-6 gap-2 w-full">
                              {["A", "B", "C", "D", "E", "F"].map((col) => (
                                <div key={col} className="h-6 flex items-center justify-center text-sm font-medium">
                                  {col}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded mr-2 ring-1 ring-gray-400"></div>
                        <span className="text-sm">Economy</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded mr-2 ring-1 ring-yellow-500"></div>
                        <span className="text-sm">Premium (+$35)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded mr-2 ring-1 ring-blue-500"></div>
                        <span className="text-sm">Business (+$120)</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded mr-2 ring-1 ring-purple-500"></div>
                        <span className="text-sm">First (+$250)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Selected Seats</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.length > 0 ? (
                    selectedSeats.map((seatId) => {
                      const seat = seatMap.seats.find((s) => s.id === seatId)
                      return (
                        <div key={seatId} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded">
                          <User className="h-4 w-4 mr-1" />
                          <span>Seat {seatId}</span>
                          {seat && getSeatPrice(seat.class) > 0 && (
                            <span className="ml-1">+${getSeatPrice(seat.class)}</span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <span className="text-sm">No seats selected</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Passenger Details</h2>
                  <p className="text-sm text-gray-500 mb-4">Please enter details for each passenger.</p>
                  {/* Passenger details form here */}
                </CardContent>
              </Card>

              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Total Price</h3>
                <div className="flex items-center justify-between bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  <span>Total</span>
                  <span>${getTotalPrice()}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button onClick={handleContinue} className="w-full">
                  Continue
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}

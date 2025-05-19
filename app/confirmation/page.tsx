"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, Plane, ArrowRight, Calendar, MapPin, CreditCard } from "lucide-react"
import { mockFlights } from "@/lib/mock-data"
import { getCurrentUser } from "@/lib/auth"
import { createBooking } from "@/lib/bookings"
import { getUserPaymentMethods } from "@/lib/payment-methods"
import type { UserType, PassengerType, PaymentMethodType } from "@/lib/types"
import MainLayout from "@/components/main-layout"

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [bookingReference, setBookingReference] = useState("")
  const [user, setUser] = useState<UserType | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [passengers, setPassengers] = useState<PassengerType[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")

  const flightId = searchParams.get("flightId")
  const selectedSeats = searchParams.get("seats")?.split(",") || []
  const totalPrice = searchParams.get("totalPrice") || "0"

  const flight = mockFlights.find((f) => f.id === flightId)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)

          // Initialize passenger forms
          const initialPassengers = selectedSeats.map((_, index) => ({
            firstName: index === 0 ? currentUser.firstName : "",
            lastName: index === 0 ? currentUser.lastName : "",
            dateOfBirth: "",
            nationality: "",
            passportNumber: "",
          }))

          setPassengers(initialPassengers)

          // Fetch payment methods
          const methods = await getUserPaymentMethods(currentUser.id)
          setPaymentMethods(methods)

          // Set default payment method if available
          const defaultMethod = methods.find((m) => m.isDefault)
          if (defaultMethod) {
            setSelectedPaymentMethod(defaultMethod.id)
          } else if (methods.length > 0) {
            setSelectedPaymentMethod(methods[0].id)
          }
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
  }, [router, selectedSeats])

  const handlePassengerChange = (index: number, field: keyof PassengerType, value: string) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value,
    }
    setPassengers(updatedPassengers)
  }

  const handleSignOut = async () => {
    // Implementation of sign out
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
      <MainLayout user={user} onSignOut={handleSignOut} currentPath="/confirmation">
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsBooking(true)

    try {
      // Create booking in storage
      const booking = await createBooking({
        userId: user.id,
        flightId: flightId || "",
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        departureDate: new Date().toISOString().split("T")[0], // Using today's date for demo
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        seats: selectedSeats,
        passengers: passengers,
        totalPrice: Number.parseFloat(totalPrice),
        paymentMethodId: selectedPaymentMethod,
      })

      setBookingReference(booking.confirmationNumber)
      setIsBooked(true)
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("There was an error processing your booking. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  if (isBooked) {
    return (
      <MainLayout user={user} onSignOut={handleSignOut} currentPath="/confirmation">
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
                  <p className="text-gray-600">
                    Your booking reference is <span className="font-bold">{bookingReference}</span>
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full p-2 mr-4">
                      <Plane className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">FlyDreamAir Flight {flight.flightNumber}</h3>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <span className="font-medium">{flight.origin}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span className="font-medium">{flight.destination}</span>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Departure: {flight.departureTime}</span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>Seats: {selectedSeats.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="font-semibold">Booking Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Booking Reference</div>
                      <div className="font-medium">{bookingReference}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Payment Method</div>
                      <div className="font-medium">
                        {paymentMethods.find((pm) => pm.id === selectedPaymentMethod)?.cardNumber || "Credit Card"}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Total Amount</div>
                      <div className="font-medium">${totalPrice}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Booking Date</div>
                      <div className="font-medium">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• A confirmation email has been sent to your email address.</li>
                    <li>• You can check in online 24 hours before your flight.</li>
                    <li>• Please arrive at the airport at least 2 hours before your flight.</li>
                    <li>• Don't forget to bring your ID or passport.</li>
                  </ul>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild variant="outline">
                    <Link href="/dashboard">Return to Dashboard</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/my-bookings">View My Bookings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout user={user} onSignOut={handleSignOut} currentPath="/confirmation">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Complete Your Booking</h1>
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
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6">Passenger Information</h2>

                  <form onSubmit={handleBooking}>
                    <div className="grid gap-6">
                      {selectedSeats.map((seat, index) => (
                        <div key={seat} className="space-y-4">
                          <h3 className="font-medium">
                            Passenger {index + 1} (Seat {seat})
                          </h3>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`firstName-${index}`}>First Name</Label>
                              <Input
                                id={`firstName-${index}`}
                                value={passengers[index]?.firstName || ""}
                                onChange={(e) => handlePassengerChange(index, "firstName", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                              <Input
                                id={`lastName-${index}`}
                                value={passengers[index]?.lastName || ""}
                                onChange={(e) => handlePassengerChange(index, "lastName", e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                              <Input
                                id={`dob-${index}`}
                                type="date"
                                value={passengers[index]?.dateOfBirth || ""}
                                onChange={(e) => handlePassengerChange(index, "dateOfBirth", e.target.value)}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor={`nationality-${index}`}>Nationality</Label>
                              <Input
                                id={`nationality-${index}`}
                                value={passengers[index]?.nationality || ""}
                                onChange={(e) => handlePassengerChange(index, "nationality", e.target.value)}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`passport-${index}`}>Passport/ID Number</Label>
                            <Input
                              id={`passport-${index}`}
                              value={passengers[index]?.passportNumber || ""}
                              onChange={(e) => handlePassengerChange(index, "passportNumber", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <h2 className="text-xl font-bold mt-8 mb-6">Contact Information</h2>

                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={user?.email} required />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" required />
                      </div>
                    </div>

                    <h2 className="text-xl font-bold mt-8 mb-6">Payment Information</h2>

                    {paymentMethods.length > 0 ? (
                      <div className="space-y-4">
                        <Label>Select Payment Method</Label>
                        <div className="grid gap-4">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.id}
                              className={`flex items-center p-4 border rounded-md cursor-pointer ${
                                selectedPaymentMethod === method.id ? "border-blue-500 bg-blue-50" : ""
                              }`}
                              onClick={() => setSelectedPaymentMethod(method.id)}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                checked={selectedPaymentMethod === method.id}
                                onChange={() => setSelectedPaymentMethod(method.id)}
                                className="mr-3"
                              />
                              <div className="flex items-center flex-1">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <CreditCard className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)}
                                    {method.isDefault && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500">{method.cardNumber}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <Button type="button" variant="outline" asChild>
                            <Link href="/payment-methods">Manage Payment Methods</Link>
                          </Button>
                          <Button type="button" variant="outline" asChild>
                            <Link href="/payment-methods">Add New Card</Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Tabs defaultValue="card">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="card">Credit Card</TabsTrigger>
                          <TabsTrigger value="paypal">PayPal</TabsTrigger>
                          <TabsTrigger value="apple">Apple Pay</TabsTrigger>
                        </TabsList>
                        <TabsContent value="card" className="space-y-4 pt-4">
                          <div>
                            <Label htmlFor="cardName">Name on Card</Label>
                            <Input id="cardName" required />
                          </div>
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input id="cardNumber" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiry">Expiry Date</Label>
                              <Input id="expiry" placeholder="MM/YY" required />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input id="cvv" required />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="saveCard" />
                            <Label htmlFor="saveCard">Save this card for future bookings</Label>
                          </div>
                        </TabsContent>
                        <TabsContent value="paypal" className="pt-4">
                          <div className="text-center py-8">
                            <p className="mb-4">You will be redirected to PayPal to complete your payment.</p>
                            <Button type="button" className="w-full">
                              Continue with PayPal
                            </Button>
                          </div>
                        </TabsContent>
                        <TabsContent value="apple" className="pt-4">
                          <div className="text-center py-8">
                            <p className="mb-4">You will be redirected to Apple Pay to complete your payment.</p>
                            <Button type="button" className="w-full">
                              Continue with Apple Pay
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}

                    <div className="mt-8">
                      <Button type="submit" className="w-full" size="lg" disabled={isBooking}>
                        {isBooking ? "Processing..." : "Complete Booking"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Plane className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">FlyDreamAir</div>
                        <div className="text-sm text-gray-500">Flight {flight.flightNumber}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Route</div>
                      <div className="font-medium">
                        {flight.origin} to {flight.destination}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Date & Time</div>
                      <div className="font-medium">
                        {flight.departureTime} - {flight.arrivalTime}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Selected Seats</div>
                      <div className="font-medium">{selectedSeats.join(", ")}</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between">
                      <div className="text-sm">Flight</div>
                      <div className="font-medium">${Number.parseFloat(totalPrice) - 45}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm">Taxes & Fees</div>
                      <div className="font-medium">$45.00</div>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <div>Total</div>
                      <div>${totalPrice}</div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                    <CreditCard className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Your payment is secure and encrypted. No charges will be made until you complete your booking.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}

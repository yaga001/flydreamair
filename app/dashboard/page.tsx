"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Ticket, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FlightSearchForm from "@/components/flight-search-form"
import RecentSearches from "@/components/recent-searches"
import { getCurrentUser, signOutUser } from "@/lib/auth"
import { getUserPaymentMethods } from "@/lib/payment-methods"
import type { UserType, PaymentMethodType } from "@/lib/types"
import MainLayout from "@/components/main-layout"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)

          // Fetch payment methods
          const methods = await getUserPaymentMethods(currentUser.id)
          setPaymentMethods(methods)
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

  return (
    <MainLayout user={user} onSignOut={handleSignOut} currentPath="/dashboard">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Welcome back, {user.firstName}!</h1>
          <p className="text-blue-100">Discover your next adventure with FlyDreamAir</p>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="search" className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="search" className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                <span>Search Flights</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center">
                <Ticket className="mr-2 h-4 w-4" />
                <span>My Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Payments</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <CardTitle>Search for Flights</CardTitle>
                  <CardDescription>Find the best deals for your next trip</CardDescription>
                </CardHeader>
                <CardContent>
                  <FlightSearchForm user={user} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>View and manage your upcoming and past flights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Ticket className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Quick access to your bookings</h3>
                    <p className="text-gray-500 mb-6">
                      View all your bookings, check in for flights, and manage your travel plans.
                    </p>
                    <Button asChild>
                      <Link href="/my-bookings">View All Bookings</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods and view transaction history</CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {paymentMethods.slice(0, 2).map((method) => (
                          <div key={method.id} className="flex items-center p-3 border rounded-md">
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
                        ))}
                      </div>
                      <div className="flex justify-center mt-4">
                        <Button asChild>
                          <Link href="/payment-methods">Manage Payment Methods</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <CreditCard className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                      <p className="text-gray-500 mb-6">
                        You haven't added any payment methods yet. Add a payment method to make booking faster.
                      </p>
                      <Button asChild>
                        <Link href="/payment-methods">Add Payment Method</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <RecentSearches userId={user.id} />

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Special Offers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                    <div className="font-medium text-blue-800">Summer Sale</div>
                    <p className="text-sm text-blue-600">Get up to 20% off on international flights</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md border border-green-100">
                    <div className="font-medium text-green-800">Weekend Getaway</div>
                    <p className="text-sm text-green-600">Special rates for weekend trips</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Travel Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                      1
                    </span>
                    <span>Book flights 2-3 months in advance for the best rates</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                      2
                    </span>
                    <span>Tuesday and Wednesday are typically the cheapest days to fly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">
                      3
                    </span>
                    <span>Sign up for fare alerts to catch price drops</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}

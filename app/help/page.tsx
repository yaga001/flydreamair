"use client"
 
import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plane, User, LogOut, Settings, Bell, Search, HelpCircle, Phone, Mail, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { getCurrentUser, signOutUser } from "@/lib/auth"
import type { UserType } from "@/lib/types"

export default function HelpPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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
    // In a real app, this would search the FAQs
    alert(`Searching for: ${searchQuery}`)
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would submit the contact form
    alert("Your message has been sent. We'll get back to you soon!")
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
          <h1 className="text-2xl font-bold">Help & Support</h1>
          <p className="text-blue-100">Find answers to your questions and get assistance</p>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Search for help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                <span>Search</span>
              </Button>
            </form>
          </div>

          <Tabs defaultValue="faq" className="max-w-3xl mx-auto">
            <TabsList className="grid grid-cols-3 w-full mb-6">
              <TabsTrigger value="faq" className="flex items-center">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>FAQs</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>Contact Us</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Live Chat</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Find answers to common questions about our services</CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>How do I check in for my flight?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">
                          You can check in for your flight online through our website or mobile app starting 24 hours
                          before your scheduled departure time. You can also check in at the airport using our
                          self-service kiosks or at the check-in counter.
                        </p>
                        <Button variant="link" asChild className="p-0 h-auto mt-2">
                          <Link href="/check-in">Go to Online Check-in</Link>
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>What is the baggage allowance?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">
                          Baggage allowance varies depending on your fare type and destination:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                          <li>Economy: 1 checked bag (23kg) and 1 carry-on bag (7kg)</li>
                          <li>Premium Economy: 2 checked bags (23kg each) and 1 carry-on bag (7kg)</li>
                          <li>Business: 2 checked bags (32kg each) and 2 carry-on bags (7kg each)</li>
                          <li>First Class: 3 checked bags (32kg each) and 2 carry-on bags (7kg each)</li>
                        </ul>
                        <p className="mt-2 text-gray-600">
                          Additional baggage can be purchased during booking or at the airport for an extra fee.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionTrigger>How can I change or cancel my booking?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">
                          You can change or cancel your booking through the "My Bookings" section of our website or
                          mobile app. Changes and cancellations are subject to our fare rules:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                          <li>Flexible fares: Free changes and cancellations up to 24 hours before departure</li>
                          <li>Standard fares: Changes allowed with a fee, partial refund for cancellations</li>
                          <li>Basic fares: Changes allowed with a fee, no refund for cancellations</li>
                        </ul>
                        <Button variant="link" asChild className="p-0 h-auto mt-2">
                          <Link href="/my-bookings">Go to My Bookings</Link>
                        </Button>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                      <AccordionTrigger>What documents do I need for international travel?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">For international travel, you will need:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                          <li>A valid passport (valid for at least 6 months beyond your return date)</li>
                          <li>Visa (if required for your destination)</li>
                          <li>Travel authorization forms (such as ESTA for the US or eTA for Canada)</li>
                          <li>Return or onward ticket</li>
                          <li>Proof of accommodation</li>
                        </ul>
                        <p className="mt-2 text-gray-600">
                          Requirements vary by destination and your nationality. We recommend checking the specific
                          requirements for your destination before traveling.
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-5">
                      <AccordionTrigger>How early should I arrive at the airport?</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">We recommend arriving at the airport:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
                          <li>Domestic flights: 1.5 hours before departure</li>
                          <li>International flights: 3 hours before departure</li>
                        </ul>
                        <p className="mt-2 text-gray-600">
                          During peak travel seasons or at busy airports, you may want to allow extra time. Check-in
                          counters close 45 minutes before departure for domestic flights and 60 minutes for
                          international flights.
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>Get in touch with our customer support team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-3">
                        <Phone className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-medium">Call Us</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">24/7 Customer Support</p>
                      <p className="font-medium">+1 (800) 123-4567</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-3">
                        <Mail className="h-5 w-5 text-blue-600 mr-2" />
                        <h3 className="font-medium">Email Us</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Response within 24 hours</p>
                      <p className="font-medium">support@flydreamair.com</p>
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <Input id="name" defaultValue={`${user.firstName} ${user.lastName}`} required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email
                        </label>
                        <Input id="email" type="email" defaultValue={user.email} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input id="subject" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea id="message" rows={5} required />
                    </div>
                    <Button type="submit">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle>Live Chat</CardTitle>
                  <CardDescription>Chat with our support team in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Start a Live Chat</h3>
                    <p className="text-gray-500 mb-6">
                      Our support agents are available 24/7 to assist you with any questions or concerns.
                    </p>
                    <Button>Start Chat</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

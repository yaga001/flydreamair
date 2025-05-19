"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, ArrowRightIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { saveSearchHistory } from "@/lib/search-history"
import type { UserType } from "@/lib/types"

interface FlightSearchFormProps {
  user: UserType
}

export default function FlightSearchForm({ user }: FlightSearchFormProps) {
  const router = useRouter()
  const [tripType, setTripType] = useState("roundtrip")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [departDate, setDepartDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [passengers, setPassengers] = useState("1")
  const [cabinClass, setCabinClass] = useState("economy")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!origin || !destination || !departDate) {
      alert("Please fill in all required fields")
      return
    }

    if (tripType === "roundtrip" && !returnDate) {
      alert("Please select a return date")
      return
    }

    // Save search to history
    await saveSearchHistory(user.id, {
      origin,
      destination,
      departDate: departDate.toISOString(),
      returnDate: returnDate?.toISOString(),
      passengers,
      cabinClass,
      tripType,
    })

    // Build query params
    const params = new URLSearchParams({
      origin,
      destination,
      departDate: departDate.toISOString(),
      passengers,
      cabinClass,
      tripType,
    })

    if (tripType === "roundtrip" && returnDate) {
      params.append("returnDate", returnDate.toISOString())
    }

    // Navigate to results page
    router.push(`/flights?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="roundtrip" className="mb-6" onValueChange={setTripType}>
        <TabsList className="grid grid-cols-2 w-[300px]">
          <TabsTrigger value="roundtrip">Round Trip</TabsTrigger>
          <TabsTrigger value="oneway">One Way</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="origin">From</Label>
          <Input
            id="origin"
            placeholder="City or Airport"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="destination">To</Label>
          <div className="relative">
            <Input
              id="destination"
              placeholder="City or Airport"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:flex hidden">
              <div className="bg-blue-100 rounded-full p-1">
                <ArrowRightIcon className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="depart-date">Depart</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="depart-date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !departDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {departDate ? format(departDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={departDate}
                onSelect={setDepartDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="return-date">Return</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="return-date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !returnDate && "text-muted-foreground")}
                disabled={tripType === "oneway"}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, "PPP") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={setReturnDate}
                initialFocus
                disabled={(date) => date < (departDate || new Date())}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <Label htmlFor="passengers">Passengers</Label>
          <Select value={passengers} onValueChange={setPassengers}>
            <SelectTrigger id="passengers">
              <SelectValue placeholder="Select passengers" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Passenger" : "Passengers"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="cabin-class">Cabin Class</Label>
          <Select value={cabinClass} onValueChange={setCabinClass}>
            <SelectTrigger id="cabin-class">
              <SelectValue placeholder="Select cabin class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="premium">Premium Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full py-6 text-lg">
        Search Flights
      </Button>
    </form>
  )
}

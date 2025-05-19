import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plane, Calendar, Clock, MapPin, User, QrCode } from "lucide-react"
import type { BookingType } from "@/lib/types"

interface VirtualTicketProps {
  booking: BookingType
}

export default function VirtualTicket({ booking }: VirtualTicketProps) {
  return (
    <Card className="overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Plane className="h-6 w-6 mr-2" />
            <h3 className="font-bold text-lg">FlyDreamAir</h3>
          </div>
          <div className="text-sm">Boarding Pass</div>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500">Flight</div>
              <div className="font-bold text-xl">FlyDreamAir {booking.flightNumber}</div>
            </div>
            <div className="mt-2 md:mt-0">
              <div className="text-sm text-gray-500">Confirmation</div>
              <div className="font-bold text-xl">{booking.confirmationNumber}</div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-2xl font-bold">{booking.departureTime}</div>
                <div className="text-sm text-gray-500">{booking.origin}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-500">{booking.flightNumber}</div>
                <div className="relative w-24 h-px bg-gray-300 my-2">
                  <div className="absolute top-1/2 left-0 w-2 h-2 -mt-1 rounded-full bg-blue-600"></div>
                  <div className="absolute top-1/2 right-0 w-2 h-2 -mt-1 rounded-full bg-blue-600"></div>
                </div>
                <div className="text-xs text-gray-500">Direct</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{booking.arrivalTime}</div>
                <div className="text-sm text-gray-500">{booking.destination}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Date</span>
              </div>
              <div className="font-medium">
                {new Date(booking.departureDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Boarding</span>
              </div>
              <div className="font-medium">
                {/* Calculate boarding time (30 min before departure) */}
                {(() => {
                  const [hour, minute] = booking.departureTime.split(":")
                  const hourNum = Number.parseInt(hour)
                  const minuteNum = Number.parseInt(minute)
                  let boardingHour = hourNum
                  let boardingMinute = minuteNum - 30
                  if (boardingMinute < 0) {
                    boardingMinute += 60
                    boardingHour -= 1
                    if (boardingHour < 0) boardingHour += 12
                  }
                  return `${boardingHour}:${boardingMinute.toString().padStart(2, "0")} ${booking.departureTime.includes("AM") ? "AM" : "PM"}`
                })()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Gate</span>
              </div>
              <div className="font-medium">
                {/* Random gate number */}
                {`${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(Math.random() * 30) + 1}`}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>Seat(s)</span>
              </div>
              <div className="font-medium">{booking.seats.join(", ")}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="text-sm text-gray-500">Passenger(s)</div>
              <div className="font-medium">
                {booking.passengers.map((passenger, index) => (
                  <div key={index}>
                    {passenger.firstName} {passenger.lastName}
                    {index < booking.passengers.length - 1 ? ", " : ""}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="border border-gray-300 p-2 rounded">
                <QrCode className="h-16 w-16 text-gray-800" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-sm text-gray-600">
          <p>Please arrive at the airport at least 2 hours before your scheduled departure time.</p>
        </div>
      </CardContent>
    </Card>
  )
}

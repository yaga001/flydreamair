import type { BookingType } from "./types"
import { mockBookings } from "./mock-data"
import { saveBooking, getBookings, getBookingById } from "./storage"

// Function to get bookings for a user
export async function getUserBookings(userId: string): Promise<BookingType[]> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return []
  }
 
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get bookings from storage
  let bookings = getBookings(userId)

  // If no bookings found, initialize with mock data
  if (bookings.length === 0) {
    // Use the mock data and set the userId
    bookings = mockBookings.map((booking) => ({
      ...booking,
      userId,
      confirmationNumber: generateConfirmationNumber(),
      passengers: booking.passengers.map
        ? booking.passengers
        : [
            {
              firstName: "John",
              lastName: "Doe",
              dateOfBirth: "1990-01-01",
              nationality: "United States",
              passportNumber: "AB123456",
            },
          ],
    }))

    // Store each booking
    bookings.forEach((booking) => saveBooking(booking))
  }

  return bookings
}

// Function to create a new booking
export async function createBooking(
  bookingData: Omit<BookingType, "id" | "bookingDate" | "status" | "confirmationNumber">,
): Promise<BookingType> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Cannot create booking on the server")
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Create new booking
  const newBooking: BookingType = {
    ...bookingData,
    id: `booking-${Date.now()}`,
    bookingDate: new Date().toISOString().split("T")[0],
    status: "confirmed",
    confirmationNumber: generateConfirmationNumber(),
  }

  // Save booking to storage
  saveBooking(newBooking)

  return newBooking
}

// Function to cancel a booking
export async function cancelBooking(bookingId: string): Promise<BookingType> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Cannot cancel booking on the server")
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Get existing bookings from localStorage
  const bookingsJson = localStorage.getItem("bookings.json") || "[]"
  const bookings: BookingType[] = JSON.parse(bookingsJson)

  // Find the booking to cancel
  const bookingIndex = bookings.findIndex((booking) => booking.id === bookingId)
  if (bookingIndex === -1) {
    throw new Error("Booking not found")
  }

  // Update the booking status
  bookings[bookingIndex].status = "cancelled"

  // Save the updated bookings
  localStorage.setItem("bookings.json", JSON.stringify(bookings))

  return bookings[bookingIndex]
}

// Function to get a booking by ID
export async function getBooking(bookingId: string): Promise<BookingType | null> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return getBookingById(bookingId)
}

// Helper function to generate a confirmation number
function generateConfirmationNumber(): string {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed confusing characters like I, O, 0, 1
  let result = "FD"
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

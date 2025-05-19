// This file simulates file-based storage using localStorage in the browser
// In a production environment, this would be replaced with a real database

import type { BookingType, SearchHistoryItem, PaymentMethodType } from "./types"

// Bookings storage
export const saveBooking = (booking: BookingType): void => {
  if (typeof window === "undefined") return

  // Get existing bookings
  const bookingsJson = localStorage.getItem("bookings.json") || "[]"
  const bookings: BookingType[] = JSON.parse(bookingsJson)

  // Add new booking
  bookings.push(booking)

  // Save back to storage
  localStorage.setItem("bookings.json", JSON.stringify(bookings))
}

export const getBookings = (userId: string): BookingType[] => {
  if (typeof window === "undefined") return []

  // Get bookings from storage
  const bookingsJson = localStorage.getItem("bookings.json") || "[]"
  const bookings: BookingType[] = JSON.parse(bookingsJson)

  // Filter by user ID
  return bookings.filter((booking) => booking.userId === userId)
}

export const getBookingById = (bookingId: string): BookingType | null => {
  if (typeof window === "undefined") return null

  // Get bookings from storage
  const bookingsJson = localStorage.getItem("bookings.json") || "[]"
  const bookings: BookingType[] = JSON.parse(bookingsJson)

  // Find booking by ID
  return bookings.find((booking) => booking.id === bookingId) || null
}

export const updateBooking = (bookingId: string, updates: Partial<BookingType>): BookingType | null => {
  if (typeof window === "undefined") return null

  // Get bookings from storage
  const bookingsJson = localStorage.getItem("bookings.json") || "[]"
  const bookings: BookingType[] = JSON.parse(bookingsJson)

  // Find booking by ID
  const bookingIndex = bookings.findIndex((booking) => booking.id === bookingId)
  if (bookingIndex === -1) return null

  // Update booking
  bookings[bookingIndex] = { ...bookings[bookingIndex], ...updates }

  // Save back to storage
  localStorage.setItem("bookings.json", JSON.stringify(bookings))

  return bookings[bookingIndex]
}

// Recent searches storage
export const saveRecentSearch = (userId: string, searchData: SearchHistoryItem): void => {
  if (typeof window === "undefined") return

  // Get existing searches
  const searchesJson = localStorage.getItem("recentSearches.json") || "{}"
  const searches = JSON.parse(searchesJson)

  // Initialize user's searches if not exists
  if (!searches[userId]) {
    searches[userId] = []
  }

  // Check if this search already exists
  const existingIndex = searches[userId].findIndex(
    (item: SearchHistoryItem) =>
      item.origin === searchData.origin &&
      item.destination === searchData.destination &&
      item.departDate === searchData.departDate,
  )

  // If exists, remove it (to add it to the top)
  if (existingIndex !== -1) {
    searches[userId].splice(existingIndex, 1)
  }

  // Add new search to the beginning
  searches[userId].unshift(searchData)

  // Keep only the last 5 searches
  searches[userId] = searches[userId].slice(0, 5)

  // Save back to storage
  localStorage.setItem("recentSearches.json", JSON.stringify(searches))
}

export const getRecentSearches = (userId: string): SearchHistoryItem[] => {
  if (typeof window === "undefined") return []

  // Get searches from storage
  const searchesJson = localStorage.getItem("recentSearches.json") || "{}"
  const searches = JSON.parse(searchesJson)

  // Return user's searches or empty array
  return searches[userId] || []
}

// Payment methods storage
export const savePaymentMethod = (paymentMethod: PaymentMethodType): void => {
  if (typeof window === "undefined") return

  // Get existing payment methods
  const paymentMethodsJson = localStorage.getItem("paymentMethods.json") || "[]"
  const paymentMethods: PaymentMethodType[] = JSON.parse(paymentMethodsJson)

  // If this is set as default, unset any other default for this user
  if (paymentMethod.isDefault) {
    paymentMethods.forEach((pm) => {
      if (pm.userId === paymentMethod.userId && pm.id !== paymentMethod.id) {
        pm.isDefault = false
      }
    })
  }

  // Check if payment method already exists (for updates)
  const existingIndex = paymentMethods.findIndex((pm) => pm.id === paymentMethod.id)
  if (existingIndex !== -1) {
    // Update existing payment method
    paymentMethods[existingIndex] = paymentMethod
  } else {
    // Add new payment method
    paymentMethods.push(paymentMethod)
  }

  // Save back to storage
  localStorage.setItem("paymentMethods.json", JSON.stringify(paymentMethods))
}

export const getPaymentMethods = (userId: string): PaymentMethodType[] => {
  if (typeof window === "undefined") return []

  // Get payment methods from storage
  const paymentMethodsJson = localStorage.getItem("paymentMethods.json") || "[]"
  const paymentMethods: PaymentMethodType[] = JSON.parse(paymentMethodsJson)

  // Filter by user ID
  return paymentMethods.filter((pm) => pm.userId === userId)
}

export const getPaymentMethodById = (paymentMethodId: string): PaymentMethodType | null => {
  if (typeof window === "undefined") return null

  // Get payment methods from storage
  const paymentMethodsJson = localStorage.getItem("paymentMethods.json") || "[]"
  const paymentMethods: PaymentMethodType[] = JSON.parse(paymentMethodsJson)

  // Find payment method by ID
  return paymentMethods.find((pm) => pm.id === paymentMethodId) || null
}

export const deletePaymentMethod = (paymentMethodId: string): boolean => {
  if (typeof window === "undefined") return false

  // Get payment methods from storage
  const paymentMethodsJson = localStorage.getItem("paymentMethods.json") || "[]"
  const paymentMethods: PaymentMethodType[] = JSON.parse(paymentMethodsJson)

  // Find payment method by ID
  const index = paymentMethods.findIndex((pm) => pm.id === paymentMethodId)
  if (index === -1) return false

  // Remove payment method
  paymentMethods.splice(index, 1)

  // Save back to storage
  localStorage.setItem("paymentMethods.json", JSON.stringify(paymentMethods))

  return true
}

export const setDefaultPaymentMethod = (userId: string, paymentMethodId: string): boolean => {
  if (typeof window === "undefined") return false

  // Get payment methods from storage
  const paymentMethodsJson = localStorage.getItem("paymentMethods.json") || "[]"
  const paymentMethods: PaymentMethodType[] = JSON.parse(paymentMethodsJson)

  // Update default status
  let found = false
  paymentMethods.forEach((pm) => {
    if (pm.userId === userId) {
      if (pm.id === paymentMethodId) {
        pm.isDefault = true
        found = true
      } else {
        pm.isDefault = false
      }
    }
  })

  if (!found) return false

  // Save back to storage
  localStorage.setItem("paymentMethods.json", JSON.stringify(paymentMethods))

  return true
}

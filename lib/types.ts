export interface UserType {
  id: string
  firstName: string
  lastName: string
  email: string
  password?: string
}

export interface FlightType {
  id: string
  flightNumber: string
  origin: string
  destination: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  airline: string
}

export interface SeatType {
  id: string
  status: "available" | "occupied"
  class: "economy" | "premium" | "business" | "first"
}

export interface SeatMapType {
  rows: number
  columns: number
  seats: SeatType[]
}

export interface BookingType {
  id: string
  userId: string
  flightId: string
  flightNumber: string
  origin: string
  destination: string
  departureDate: string
  departureTime: string
  arrivalTime: string
  seats: string[]
  passengers: PassengerType[]
  totalPrice: number
  status: "confirmed" | "cancelled" | "completed"
  bookingDate: string
  confirmationNumber: string
  paymentMethodId?: string
}

export interface PassengerType {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  passportNumber: string
}

export interface SearchHistoryItem {
  id: string
  origin: string
  destination: string
  departDate: string
  returnDate?: string
  passengers: string
  cabinClass: string
  tripType: string
  searchDate: string
}

export interface PaymentMethodType {
  id: string
  userId: string
  type: "credit" | "debit" | "paypal"
  cardholderName: string
  cardNumber: string // Last 4 digits only for display
  expiryDate: string
  brand: "visa" | "mastercard" | "amex" | "discover" | "paypal"
  isDefault: boolean
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

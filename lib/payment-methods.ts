import type { PaymentMethodType } from "./types"
import {
  savePaymentMethod,
  getPaymentMethods,
  getPaymentMethodById,
  deletePaymentMethod,
  setDefaultPaymentMethod,
} from "./storage"

// Function to add a new payment method
export async function addPaymentMethod(paymentMethodData: Omit<PaymentMethodType, "id">): Promise<PaymentMethodType> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    throw new Error("Cannot add payment method on the server")
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Create new payment method
  const newPaymentMethod: PaymentMethodType = {
    ...paymentMethodData,
    id: `pm-${Date.now()}`,
  }

  // Mask card number - only store last 4 digits
  if (newPaymentMethod.type === "credit" || newPaymentMethod.type === "debit") {
    const lastFourDigits = newPaymentMethod.cardNumber.slice(-4)
    newPaymentMethod.cardNumber = `**** **** **** ${lastFourDigits}`
  }

  // Save payment method to storage
  savePaymentMethod(newPaymentMethod)

  return newPaymentMethod
}

// Function to get payment methods for a user
export async function getUserPaymentMethods(userId: string): Promise<PaymentMethodType[]> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return []
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return getPaymentMethods(userId)
}

// Function to get a payment method by ID
export async function getPaymentMethod(paymentMethodId: string): Promise<PaymentMethodType | null> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return getPaymentMethodById(paymentMethodId)
}

// Function to update a payment method
export async function updatePaymentMethod(
  paymentMethodId: string,
  updates: Partial<PaymentMethodType>,
): Promise<PaymentMethodType | null> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return null
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Get existing payment method
  const existingPaymentMethod = getPaymentMethodById(paymentMethodId)
  if (!existingPaymentMethod) {
    return null
  }

  // Create updated payment method
  const updatedPaymentMethod: PaymentMethodType = {
    ...existingPaymentMethod,
    ...updates,
  }

  // Save updated payment method
  savePaymentMethod(updatedPaymentMethod)

  return updatedPaymentMethod
}

// Function to delete a payment method
export async function removePaymentMethod(paymentMethodId: string): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return false
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return deletePaymentMethod(paymentMethodId)
}

// Function to set a payment method as default
export async function makeDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return false
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return setDefaultPaymentMethod(userId, paymentMethodId)
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addPaymentMethod, updatePaymentMethod } from "@/lib/payment-methods"
import type { PaymentMethodType } from "@/lib/types"

interface PaymentMethodFormProps {
  userId: string
  paymentMethod?: PaymentMethodType
  onSuccess: () => void
  onCancel: () => void
}

export default function PaymentMethodForm({ userId, paymentMethod, onSuccess, onCancel }: PaymentMethodFormProps) {
  const [formData, setFormData] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    type: "credit" as "credit" | "debit" | "paypal",
    brand: "visa" as "visa" | "mastercard" | "amex" | "discover" | "paypal",
    isDefault: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // If editing, populate form with existing data
  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        cardholderName: paymentMethod.cardholderName,
        // Don't populate masked card number when editing
        cardNumber: "",
        expiryDate: paymentMethod.expiryDate,
        cvv: "",
        type: paymentMethod.type,
        brand: paymentMethod.brand,
        isDefault: paymentMethod.isDefault,
      })
    }
  }, [paymentMethod])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | { name: string; value: string | boolean }) => {
    const { name, value } = e.target ? e.target : e
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Cardholder name is required"
    }

    if (formData.type !== "paypal") {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required"
      } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
        newErrors.cardNumber = "Please enter a valid 16-digit card number"
      }

      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required"
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = "Please use MM/YY format"
      }

      if (!formData.cvv.trim()) {
        newErrors.cvv = "CVV is required"
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = "CVV must be 3 or 4 digits"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (paymentMethod) {
        // Update existing payment method
        await updatePaymentMethod(paymentMethod.id, {
          ...paymentMethod,
          cardholderName: formData.cardholderName,
          expiryDate: formData.expiryDate,
          isDefault: formData.isDefault,
          // Only update card number if provided (not masked)
          ...(formData.cardNumber ? { cardNumber: formData.cardNumber } : {}),
        })
      } else {
        // Add new payment method
        await addPaymentMethod({
          userId,
          cardholderName: formData.cardholderName,
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          type: formData.type,
          brand: formData.brand,
          isDefault: formData.isDefault,
        })
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving payment method:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="type">Payment Type</Label>
        <Select name="type" value={formData.type} onValueChange={(value) => handleChange({ name: "type", value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit">Credit Card</SelectItem>
            <SelectItem value="debit">Debit Card</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.type !== "paypal" && (
        <div className="space-y-2">
          <Label htmlFor="brand">Card Brand</Label>
          <Select name="brand" value={formData.brand} onValueChange={(value) => handleChange({ name: "brand", value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select card brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="mastercard">Mastercard</SelectItem>
              <SelectItem value="amex">American Express</SelectItem>
              <SelectItem value="discover">Discover</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          name="cardholderName"
          value={formData.cardholderName}
          onChange={handleChange}
          placeholder="Name as it appears on card"
        />
        {errors.cardholderName && <p className="text-sm text-red-500">{errors.cardholderName}</p>}
      </div>

      {formData.type !== "paypal" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder={paymentMethod ? "Leave blank to keep current card" : "1234 5678 9012 3456"}
              maxLength={19}
            />
            {errors.cardNumber && <p className="text-sm text-red-500">{errors.cardNumber}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                placeholder="MM/YY"
                maxLength={5}
              />
              {errors.expiryDate && <p className="text-sm text-red-500">{errors.expiryDate}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                placeholder="123"
                maxLength={4}
                type="password"
              />
              {errors.cvv && <p className="text-sm text-red-500">{errors.cvv}</p>}
            </div>
          </div>
        </>
      )}

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) => handleChange({ name: "isDefault", value: !!checked })}
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          Set as default payment method
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : paymentMethod ? "Update" : "Add Payment Method"}
        </Button>
      </div>
    </form>
  )
}

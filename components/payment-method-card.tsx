"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CreditCard, Trash2, CheckCircle, Edit } from "lucide-react"
import type { PaymentMethodType } from "@/lib/types"

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethodType
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
  onEdit: (paymentMethod: PaymentMethodType) => void
}

export default function PaymentMethodCard({ paymentMethod, onDelete, onSetDefault, onEdit }: PaymentMethodCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    await onDelete(paymentMethod.id)
    setIsDeleting(false)
  }

  const getCardIcon = () => {
    switch (paymentMethod.brand) {
      case "visa":
        return "💳 Visa"
      case "mastercard":
        return "💳 Mastercard"
      case "amex":
        return "💳 American Express"
      case "discover":
        return "💳 Discover"
      case "paypal":
        return "PayPal"
      default:
        return "💳"
    }
  }

  return (
    <Card className={`overflow-hidden ${paymentMethod.isDefault ? "border-blue-400" : ""}`}>
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                  paymentMethod.brand === "paypal" ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                <CreditCard className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium flex items-center">
                  {getCardIcon()}
                  {paymentMethod.isDefault && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">Default</Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {paymentMethod.type === "paypal" ? "PayPal Account" : paymentMethod.cardNumber}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500"
                onClick={() => onEdit(paymentMethod)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this payment method? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Cardholder</div>
              <div>{paymentMethod.cardholderName}</div>
            </div>
            <div>
              <div className="text-gray-500">Expires</div>
              <div>{paymentMethod.expiryDate}</div>
            </div>
          </div>

          {!paymentMethod.isDefault && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onSetDefault(paymentMethod.id)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Set as Default
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, CreditCard } from "lucide-react"
import { getCurrentUser, signOutUser } from "@/lib/auth"
import { getUserPaymentMethods, removePaymentMethod, makeDefaultPaymentMethod } from "@/lib/payment-methods"
import PaymentMethodCard from "@/components/payment-method-card"
import PaymentMethodForm from "@/components/payment-method-form"
import MainLayout from "@/components/main-layout"
import type { UserType, PaymentMethodType } from "@/lib/types"

export default function PaymentMethodsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          fetchPaymentMethods(currentUser.id)
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

  const fetchPaymentMethods = async (userId: string) => {
    try {
      const methods = await getUserPaymentMethods(userId)
      setPaymentMethods(methods)
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    }
  }

  const handleAddPaymentMethod = () => {
    setSelectedPaymentMethod(null)
    setIsAddDialogOpen(true)
  }

  const handleEditPaymentMethod = (paymentMethod: PaymentMethodType) => {
    setSelectedPaymentMethod(paymentMethod)
    setIsEditDialogOpen(true)
  }

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await removePaymentMethod(id)
      if (user) {
        fetchPaymentMethods(user.id)
      }
    } catch (error) {
      console.error("Error deleting payment method:", error)
    }
  }

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      if (user) {
        await makeDefaultPaymentMethod(user.id, id)
        fetchPaymentMethods(user.id)
      }
    } catch (error) {
      console.error("Error setting default payment method:", error)
    }
  }

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
    <MainLayout user={user} onSignOut={handleSignOut} currentPath="/payment-methods">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-blue-100">Manage your payment methods securely</p>
        </div>
      </div>

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your Payment Methods</h2>
            <Button onClick={handleAddPaymentMethod}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {paymentMethods.map((paymentMethod) => (
                <PaymentMethodCard
                  key={paymentMethod.id}
                  paymentMethod={paymentMethod}
                  onDelete={handleDeletePaymentMethod}
                  onSetDefault={handleSetDefaultPaymentMethod}
                  onEdit={handleEditPaymentMethod}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center py-12">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No payment methods</h3>
                <p className="text-gray-500 mb-6">
                  You haven't added any payment methods yet. Add a payment method to make booking faster.
                </p>
                <Button onClick={handleAddPaymentMethod}>Add Payment Method</Button>
              </CardContent>
            </Card>
          )}

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Payment Security</CardTitle>
              <CardDescription>How we keep your payment information secure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Secure Storage</h3>
                    <p className="text-gray-600 text-sm">
                      Your payment information is encrypted and securely stored. We only display the last 4 digits of
                      your card number.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">PCI Compliance</h3>
                    <p className="text-gray-600 text-sm">
                      We follow industry-standard security practices to protect your payment information.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Control Your Data</h3>
                    <p className="text-gray-600 text-sm">
                      You can delete your payment methods at any time. We never share your payment information with
                      third parties.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <PaymentMethodForm
            userId={user.id}
            onSuccess={() => {
              setIsAddDialogOpen(false)
              if (user) {
                fetchPaymentMethods(user.id)
              }
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Payment Method Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
          </DialogHeader>
          {selectedPaymentMethod && (
            <PaymentMethodForm
              userId={user.id}
              paymentMethod={selectedPaymentMethod}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                if (user) {
                  fetchPaymentMethods(user.id)
                }
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  )
}

'use client'

import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { createPayPalOrder, capturePayPalOrder } from '../actions/paypal-actions'

interface PayPalCheckoutProps {
  amount: number
  tradeId: string
  onSuccess: () => void
  onError: (error: string) => void
}

export default function PayPalCheckout({ amount, tradeId, onSuccess, onError }: PayPalCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateOrder = async () => {
    setIsLoading(true)
    try {
      const orderId = await createPayPalOrder(amount.toFixed(2), tradeId)
      setIsLoading(false)
      return orderId
    } catch (error) {
      setIsLoading(false)
      onError('Failed to create order')
      throw error
    }
  }

  const handleApprove = async (data: { orderID: string }) => {
    setIsLoading(true)
    try {
      const result = await capturePayPalOrder(data.orderID)
      setIsLoading(false)
      if (result.success) {
        onSuccess()
      } else {
        onError('Failed to capture order')
      }
    } catch (error) {
      setIsLoading(false)
      onError('Failed to process payment')
      throw error
    }
  }

  return (
    <PayPalScriptProvider
      options={{
        'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: 'USD',
        intent: 'capture'
      }}
    >
      <PayPalButtons
        style={{
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 50
        }}
        disabled={isLoading}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
      />
      {isLoading && (
        <div className="mt-4 text-center text-gray-400">
          Processing your payment...
        </div>
      )}
    </PayPalScriptProvider>
  )
}

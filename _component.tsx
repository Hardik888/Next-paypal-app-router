'use client'
const Component = (amount,id) => {
  return (
    <PayPalCheckout
      amount={amountToPay}
      tradeId={id}
      onSuccess={() => {
        // Handle successful payment
        console.log('Payment successful')
        }}
      onError={(error) => {
        // Handle payment error
        console.error('Payment error:', error)
      }}
    />
  )
}
export default Component 

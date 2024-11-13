'use server'

import checkoutNodeJssdk from '@paypal/checkout-server-sdk'

const configureEnvironment = function () {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  return process.env.NODE_ENV === 'production'
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret)
}

const client = function () {
  return new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment())
}

export async function createPayPalOrder(amount, customId) {
  if (!amount || !customId) {
    throw new Error("Please provide amount and custom ID")
  }

  try {
    const PaypalClient = client()
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest()
    request.headers['prefer'] = 'return=representation'
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: amount,
          },
          custom_id: customId,
        },
      ],
    })
    const response = await PaypalClient.execute(request)
    if (response.statusCode !== 201) {
      console.log("Response:", response)
      throw new Error("Error occurred while creating the order")
    }

    return response.result.id
  } catch (err) {
    console.error("Error at Create Order:", err)
    throw new Error("Could not create the order")
  }
}

export async function capturePayPalOrder(orderId) {
  if (!orderId) {
    throw new Error("Please provide Order ID")
  }

  try {
    const PaypalClient = client()
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId)
    request.requestBody({})
    const response = await PaypalClient.execute(request)
    if (!response) {
      throw new Error("Error occurred while capturing the order")
    }

    const customId = response.result.purchase_units[0].custom_id

    return { 
      success: true, 
      orderId: orderId, 
      customId: customId,
      captureId: response.result.id,
      status: response.result.status
    }
  } catch (err) {
    console.error("Error at Capture Order:", err)
    throw new Error("Could not capture the order")
  }
}

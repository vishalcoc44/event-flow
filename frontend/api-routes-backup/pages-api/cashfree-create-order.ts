import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, currency, customer } = req.body;
  // Validate input
  if (!amount || !currency || !customer) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Call Cashfree API to create order
    const response = await fetch('https://api.cashfree.com/pg/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2022-09-01',
      },
      body: JSON.stringify({
        order_amount: amount,
        order_currency: currency,
        customer_details: customer,
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/organization/subscription/confirm?order_id={order_id}`,
        },
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Failed to create order' });
    }
    return res.status(200).json({ order_id: data.order_id, payment_session_id: data.payment_session_id });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
} 
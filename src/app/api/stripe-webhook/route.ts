import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  console.log('Received Stripe webhook');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_TEST_WEBHOOK_SECRET!);
    console.log('Webhook verified. Event type:', event.type);
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    console.log('Processing checkout.session.completed event');
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Session:', JSON.stringify(session, null, 2));

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      console.log('Line items:', JSON.stringify(lineItems, null, 2));
      
      // Assuming the first item is the subscription
      const item = lineItems.data[0];
      if (!item || !item.price) {
        throw new Error('No line items or price found');
      }
      const price = await stripe.prices.retrieve(item.price.id);
      console.log('Price:', JSON.stringify(price, null, 2));
      
      const wordCount = price.metadata.words ? parseInt(price.metadata.words) : 0;
      console.log('Word count:', wordCount);
      
      if (!session.client_reference_id) {
        throw new Error('No client_reference_id found in session');
      }

      // Update user's word count in Supabase
      const { data, error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: session.client_reference_id,
          word_count: wordCount,
          subscription_id: session.subscription
        });

      if (error) {
        console.error('Error updating user subscription:', error);
        return NextResponse.json({ error: 'Failed to update user subscription' }, { status: 500 });
      }

      console.log('User subscription updated successfully:', data);
      return NextResponse.json({ received: true, updated: true });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPurchase(session);
      break;
    case 'invoice.paid':
      const invoice = event.data.object as Stripe.Invoice;
      await handleRecurringPayment(invoice);
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleSuccessfulPurchase(session: Stripe.Checkout.Session) {
  const purchasedWords = parseInt(session.metadata?.words || '0', 10);
  const purchasedPlagiatChecks = parseInt(session.metadata?.plagiat || '0', 10);
  const productName = session.metadata?.product_name || 'Unknown Plan';
  const subscriptionId = session.subscription as string | null;
  const stripeCustomerId = session.customer as string;

  const userEmail = session.customer_details?.email;
  if (!userEmail) {
    return;
  }

  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('words_remaining, plagiat_check_remaining, total_plagiat_checks, total_words')
      .eq('user_id', userEmail)
      .single();

    let newWordsRemaining, newPlagiatCheckRemaining, newTotalPlagiatChecks, newTotalWords;

    if (error && error.code === 'PGRST116') {
      newWordsRemaining = purchasedWords;
      newPlagiatCheckRemaining = purchasedPlagiatChecks;
      newTotalPlagiatChecks = purchasedPlagiatChecks;
      newTotalWords = purchasedWords;
    } else if (error) {
      throw error;
    } else {
      newWordsRemaining = (data.words_remaining || 0) + purchasedWords;
      newPlagiatCheckRemaining = (data.plagiat_check_remaining || 0) + purchasedPlagiatChecks;
      newTotalPlagiatChecks = (data.total_plagiat_checks || 0) + purchasedPlagiatChecks;
      newTotalWords = purchasedWords;
    }

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert({ 
        user_id: userEmail,
        words_remaining: newWordsRemaining,
        total_words: newTotalWords,
        plagiat_check_remaining: newPlagiatCheckRemaining,
        total_plagiat_checks: newTotalPlagiatChecks,
        plan: productName,
        subscription_id: subscriptionId,
        stripe_customer_id: stripeCustomerId
      });

    if (upsertError) throw upsertError;

    const { data: userData, error: userError } = await supabase
      .from('user_subscriptions')
      .select('referred_by')
      .eq('user_id', userEmail)
      .single();

    if (userError) throw userError;

    if (userData?.referred_by) {
      const commission = calculateCommission(session.amount_total);

      const { error: commissionError } = await supabase
        .from('affiliate_commissions')
        .insert({
          affiliate_code: userData.referred_by,
          user_email: userEmail,
          amount: commission,
          purchase_amount: session.amount_total,
          status: 'pending'
        });

      if (commissionError) throw commissionError;
    }

  } catch (error) {
    // Error handling could be improved here
  }
}

function calculateCommission(amount: number | null): number {
  return amount ? amount * 0.3 : 0;
}

async function handleRecurringPayment(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!('email' in customer)) {
      return;
    }
    const userEmail = customer.email;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const productId = subscription.items.data[0].price.product as string;
    const product = await stripe.products.retrieve(productId);

    const purchasedWords = parseInt(product.metadata.words || '0', 10);
    const purchasedPlagiatChecks = parseInt(product.metadata.plagiat || '0', 10);
    const productName = product.name || 'Unknown Plan';

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ 
        words_remaining: purchasedWords,
        total_words: purchasedWords,
        plagiat_check_remaining: purchasedPlagiatChecks,
        total_plagiat_checks: purchasedPlagiatChecks,
        plan: productName,
        subscription_id: subscriptionId
      })
      .eq('user_id', userEmail);

    if (updateError) throw updateError;
  } catch (error) {
    // Error handling could be improved here
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionEndDate = new Date(subscription.current_period_end * 1000); // Convert UNIX timestamp to Date

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (!('email' in customer)) {
      return;
    }
    const userEmail = customer.email;

    if (!userEmail) {
      return;
    }

    // Update the user's subscription data
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({ 
        subscription_end_date: subscriptionEndDate.toISOString(),
        subscription_status: 'canceled'
      })
      .eq('user_id', userEmail);

    if (updateError) throw updateError;

    // Schedule a task to remove premium benefits after the subscription ends
    // This is a placeholder - you'll need to implement a task scheduling system
    schedulePremiumRemoval(userEmail, subscriptionEndDate);

  } catch (error) {
    // Error handling could be improved here
  }
}

// Update the function signature to accept null
function schedulePremiumRemoval(userEmail: string | null, endDate: Date) {
  if (!userEmail) {
    return;
  }
  // Implement your task scheduling logic here
}

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      console.error('Not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    console.log('Fetching Stripe customer ID for user:', session.user.email);

    // Fetch the Stripe customer ID from Supabase
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', session.user.email)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!data?.stripe_customer_id) {
      console.error('No Stripe customer ID found for user:', session.user.email);
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    console.log('Creating Stripe portal session for customer:', data.stripe_customer_id);

    // Create a Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${process.env.NEXTAUTH_URL}/profile`,
    });

    console.log('Portal session created successfully');

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error in create-portal-session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
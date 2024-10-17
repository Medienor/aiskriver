import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Facebook Ad Copy Generator',
  description: 'Use our AI-powered Facebook Ad Copy Generator to create compelling and effective ad copy for your Facebook campaigns. Perfect for marketers, businesses, and advertisers.',
  keywords: ['Facebook ads', 'AI', 'ad copy generator', 'marketing', 'advertising', 'social media'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Facebook Ad Copy Generator | Innhold.AI',
    description: 'Create compelling Facebook ad copy with our AI-powered generator.',
    url: 'https://innhold.ai/tools/facebook-ad-copy-generator',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Facebook Ad Copy Generator | Innhold.AI',
    description: 'Create compelling Facebook ad copy with our AI-powered generator.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function FacebookAdCopyGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Google Ad Copy Generator',
  description: 'Use our AI-powered Google Ad Copy Generator to create compelling and effective ad copy for your Google Ads campaigns. Perfect for marketers, advertisers, and business owners.',
  keywords: ['Google Ads', 'AI', 'ad copy generator', 'PPC', 'digital marketing', 'advertising'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Google Ad Copy Generator | Innhold.AI',
    description: 'Create compelling Google Ad copy with our AI-powered generator.',
    url: 'https://innhold.ai/tools/google-ad-copy-generator',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Google Ad Copy Generator | Innhold.AI',
    description: 'Create compelling Google Ad copy with our AI-powered generator.',
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

export default function GoogleAdCopyGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
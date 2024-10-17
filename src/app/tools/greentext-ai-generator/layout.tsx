import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Greentext Generator',
  description: 'Use our AI-powered greentext generator to create unique and entertaining greentext stories. Perfect for 4chan enthusiasts, meme creators, and internet culture fans.',
  keywords: ['greentext', 'AI', 'generator', 'meme', '4chan', 'internet culture'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Greentext Generator | Innhold.AI',
    description: 'Create unique and entertaining greentext stories with our AI-powered generator.',
    url: 'https://innhold.ai/tools/greentext-ai-generator',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Greentext Generator | Innhold.AI',
    description: 'Create unique and entertaining greentext stories with our AI-powered generator.',
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

export default function GreentextGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
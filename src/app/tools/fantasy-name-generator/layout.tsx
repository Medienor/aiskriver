import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Fantasy Name Generator',
  description: 'Create unique and captivating fantasy names with our AI-powered generator. Perfect for writers, gamers, and fantasy enthusiasts.',
  keywords: ['fantasy names', 'AI', 'name generator', 'fantasy', 'creative writing', 'worldbuilding'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Fantasy Name Generator | Innhold.AI',
    description: 'Generate unique and captivating fantasy names with our AI-powered tool.',
    url: 'https://innhold.ai/tools/fantasy-name-generator',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Fantasy Name Generator | Innhold.AI',
    description: 'Generate unique and captivating fantasy names with our AI-powered tool.',
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

export default function FantasyNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
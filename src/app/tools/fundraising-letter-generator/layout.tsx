import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Fundraising Letter Generator',
  description: 'Use our AI-powered fundraising letter generator to create compelling and effective fundraising letters. Perfect for nonprofits, charities, and fundraising professionals.',
  keywords: ['fundraising', 'AI', 'letter generator', 'nonprofit', 'charity', 'donation'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Fundraising Letter Generator | Innhold.AI',
    description: 'Create compelling fundraising letters with our AI-powered generator.',
    url: 'https://innhold.ai/tools/fundraising-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Fundraising Letter Generator | Innhold.AI',
    description: 'Create compelling fundraising letters with our AI-powered generator.',
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

export default function FundraisingLetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Sitatgenerator',
  description: 'Bruk vår AI-drevne sitatgenerator for å finne inspirerende og relevante sitater. Perfekt for talere, forfattere og alle som ønsker å berike sitt innhold med meningsfulle sitater.',
  keywords: ['sitatgenerator', 'AI', 'inspirerende sitater', 'taleskrivning', 'innholdsskaping', 'motivasjon'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Sitatgenerator | Innhold.AI',
    description: 'Finn inspirerende og relevante sitater med vår AI-drevne sitatgenerator.',
    url: 'https://innhold.ai/tools/quote-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Sitatgenerator | Innhold.AI',
    description: 'Finn inspirerende og relevante sitater med vår AI-drevne sitatgenerator.',
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

export default function QuoteGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Skribent',
  description: 'Bruk vår AI-drevne skribent for å skape unikt og engasjerende innhold. Effektiviser skriveprosessen og forbedre kvaliteten på ditt innhold.',
  keywords: ['AI skribent', 'innholdsgenerering', 'tekstforfatter', 'kreativ skriving', 'AI-assistert skriving', 'innholdsoptimalisering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Skribent | Innhold.AI',
    description: 'Skap unikt og engasjerende innhold med vår AI-drevne skribent.',
    url: 'https://innhold.ai/tools/ai-writer',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Skribent | Innhold.AI',
    description: 'Skap unikt og engasjerende innhold med vår AI-drevne skribent.',
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

export default function AIWriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
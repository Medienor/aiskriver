import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plagiatkontroll (Gratis)',
  description: 'Bruk vår avanserte plagiatkontroll for å sikre at ditt innhold er unikt og originalt. Perfekt for studenter, akademikere og innholdsskapere.',
  keywords: ['plagiatkontroll', 'AI', 'originalitet', 'akademisk integritet', 'innholdskontroll', 'plagiatsjekk'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'Plagiatkontroll (Gratis) | Innhold.AI',
    description: 'Sikre originaliteten til ditt innhold med vår avanserte plagiatkontroll.',
    url: 'https://innhold.ai/plagiat-sjekker',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Plagiatkontroll | Innhold.AI',
    description: 'Sikre originaliteten til ditt innhold med vår avanserte plagiatkontroll.',
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

export default function PlagiatsjekkerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
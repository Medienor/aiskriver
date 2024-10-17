import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Fiverr-beskrivelsegenerator',
  description: 'Bruk vår AI-drevne Fiverr-beskrivelsegenerator for å skape overbevisende og effektive beskrivelser for dine Fiverr-tjenester. Perfekt for frilansere og digitale entreprenører.',
  keywords: ['Fiverr', 'AI', 'beskrivelsegenerator', 'frilans', 'markedsføring', 'gig-beskrivelse'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Fiverr-beskrivelsegenerator | Innhold.AI',
    description: 'Skap overbevisende Fiverr-beskrivelser med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/fiverr-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Fiverr-beskrivelsegenerator | Innhold.AI',
    description: 'Skap overbevisende Fiverr-beskrivelser med vår AI-drevne generator.',
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

export default function FiverrDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
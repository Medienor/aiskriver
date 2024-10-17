import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Etternavngenerator',
  description: 'Bruk vår AI-drevne etternavngenerator for å skape unike og passende etternavn. Perfekt for forfattere, spillutviklere, og alle som trenger inspirasjon til nye etternavn.',
  keywords: ['etternavn', 'AI', 'generator', 'navngiving', 'kreativitet', 'skriving', 'familienavn'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Etternavngenerator | Innhold.AI',
    description: 'Skap unike og passende etternavn med vår kraftige AI-drevne generator.',
    url: 'https://innhold.ai/tools/last-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Etternavngenerator | Innhold.AI',
    description: 'Generer kreative og unike etternavn med vår AI-drevne verktøy.',
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

export default function LastNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
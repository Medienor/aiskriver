import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Formålserklæringsgenerator for Ideelle Organisasjoner',
  description: 'Bruk vår AI-drevne generator for å skape kraftfulle og meningsfulle formålserklæringer for ideelle organisasjoner. Perfekt for grunnleggere, ledere og frivillige som ønsker å definere sin organisasjons misjon.',
  keywords: ['formålserklæring', 'ideell organisasjon', 'AI', 'generator', 'misjon', 'nonprofit', 'frivillighet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Formålserklæringsgenerator for Ideelle Organisasjoner | Innhold.AI',
    description: 'Skap kraftfulle og meningsfulle formålserklæringer for ideelle organisasjoner med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/nonprofit-mission-statement-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Formålserklæringsgenerator for Ideelle Organisasjoner | Innhold.AI',
    description: 'Skap kraftfulle og meningsfulle formålserklæringer for ideelle organisasjoner med vår AI-drevne generator.',
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

export default function NonprofitMissionStatementGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
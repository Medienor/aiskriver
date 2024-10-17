import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Jobb beskrivelse Generator',
  description: 'Bruk vår AI-drevne jobbeskrivelsegenerator for å skape profesjonelle og effektive jobbeskrivelser. Perfekt for rekrutterere, HR-profesjonelle og arbeidsgivere.',
  keywords: ['jobbeskrivelse', 'AI', 'generator', 'rekruttering', 'HR', 'ansettelse'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Jobb beskrivelse Generator | Innhold.AI',
    description: 'Skap profesjonelle og effektive jobbeskrivelser med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/job-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Job Description Generator | Innhold.AI',
    description: 'Skap profesjonelle og effektive jobbeskrivelser med vår AI-drevne generator.',
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

export default function JobDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
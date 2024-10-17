import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Verdiforslag Generator',
  description: 'Bruk vår AI-drevne verdiforslag generator for å skape overbevisende og effektive verdiforslag. Ideell for gründere, markedsførere og bedriftseiere som ønsker å tydelig kommunisere verdien av sine produkter eller tjenester.',
  keywords: ['verdiforslag', 'AI', 'generator', 'markedsføring', 'forretningsutvikling', 'kundeverdi'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Verdiforslag Generator | Innhold.AI',
    description: 'Skap overbevisende verdiforslag med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/value-proposition-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Verdiforslag Generator | Innhold.AI',
    description: 'Skap overbevisende verdiforslag med vår AI-drevne generator.',
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

export default function ValuePropositionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
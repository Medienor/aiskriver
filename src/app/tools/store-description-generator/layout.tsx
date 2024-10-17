import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Butikkbeskrivelse Generator',
  description: 'Bruk vår AI-drevne butikkbeskrivelse generator for å lage overbevisende og effektive produktbeskrivelser. Perfekt for nettbutikkeiere, markedsførere og e-handelsentusiaster som ønsker å øke salg og engasjement.',
  keywords: ['butikkbeskrivelse', 'AI', 'produktbeskrivelse', 'e-handel', 'nettbutikk', 'markedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Butikkbeskrivelse Generator | Innhold.AI',
    description: 'Lag overbevisende produktbeskrivelser med vår AI-drevne butikkbeskrivelse generator.',
    url: 'https://innhold.ai/tools/store-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Butikkbeskrivelse Generator | Innhold.AI',
    description: 'Lag overbevisende produktbeskrivelser med vår AI-drevne butikkbeskrivelse generator.',
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

export default function StoreDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
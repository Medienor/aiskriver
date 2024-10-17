import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Produktbeskrivelse Generator',
  description: 'Bruk vår AI-drevne produktbeskrivelse generator for å skape overbevisende og salgsorienterte produktbeskrivelser. Ideell for e-handelsbutikker, markedsførere og produktutviklere som ønsker å optimalisere sine produktsider.',
  keywords: ['produktbeskrivelse', 'AI', 'e-handel', 'markedsføring', 'innholdsgenerering', 'salgstekst'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Produktbeskrivelse Generator | Innhold.AI',
    description: 'Skap overbevisende produktbeskrivelser med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/product-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Produktbeskrivelse Generator | Innhold.AI',
    description: 'Skap overbevisende produktbeskrivelser med vår AI-drevne generator.',
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

export default function ProductDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
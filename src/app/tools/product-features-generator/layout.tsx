import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Produktfunksjonsgenerator',
  description: 'Bruk vår AI-drevne produktfunksjonsgenerator for å skape overbevisende og engasjerende produktbeskrivelser. Ideell for markedsførere, e-handelsbutikker og produktutviklere som ønsker å fremheve sine produkters unike egenskaper.',
  keywords: ['produktfunksjoner', 'AI', 'generator', 'produktbeskrivelser', 'e-handel', 'markedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Produktfunksjonsgenerator | Innhold.AI',
    description: 'Skap overbevisende produktbeskrivelser med vår AI-drevne produktfunksjonsgenerator.',
    url: 'https://innhold.ai/tools/product-features-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Produktfunksjonsgenerator | Innhold.AI',
    description: 'Skap overbevisende produktbeskrivelser med vår AI-drevne produktfunksjonsgenerator.',
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

export default function ProductFeaturesGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
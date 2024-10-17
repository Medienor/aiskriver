import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Amazon Produktbeskrivelse Generator',
  description: 'Bruk vår AI-drevne generator for å lage overbevisende og SEO-vennlige produktbeskrivelser for Amazon. Øk salget med unike og engasjerende beskrivelser.',
  keywords: ['Amazon produktbeskrivelse', 'AI', 'e-handel', 'SEO', 'salgstekst', 'produktmarkedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Amazon Produktbeskrivelse Generator | Innhold.AI',
    description: 'Lag overbevisende Amazon produktbeskrivelser med vår AI-drevne generator. Øk salget og forbedre SEO.',
    url: 'https://innhold.ai/tools/amazon-product-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Amazon Produktbeskrivelse Generator | Innhold.AI',
    description: 'Lag overbevisende Amazon produktbeskrivelser med vår AI-drevne generator. Øk salget og forbedre SEO.',
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

export default function AmazonProductDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
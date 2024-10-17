import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Produktbeskrivelse Generator for Shopify',
  description: 'Bruk vår AI-drevne produktbeskrivelse generator for å lage engasjerende og salgsdrivende beskrivelser for dine Shopify-produkter. Perfekt for nettbutikkeiere som ønsker å forbedre sine produktsider og øke konverteringer.',
  keywords: ['Shopify', 'AI', 'produktbeskrivelse', 'e-handel', 'konverteringsoptimalisering', 'nettbutikk'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Produktbeskrivelse Generator for Shopify | Innhold.AI',
    description: 'Lag engasjerende produktbeskrivelser for din Shopify-butikk med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/shopify-product-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Produktbeskrivelse Generator for Shopify | Innhold.AI',
    description: 'Lag engasjerende produktbeskrivelser for din Shopify-butikk med vår AI-drevne generator.',
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

export default function ShopifyProductDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
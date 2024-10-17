import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Produktnavngenerator',
  description: 'Bruk vår AI-drevne produktnavngenerator for å skape unike og minneverdige navn for dine produkter. Perfekt for gründere, markedsførere og bedriftseiere som ønsker å skille seg ut i markedet.',
  keywords: ['produktnavn', 'AI', 'navngenerator', 'merkevarebygging', 'markedsføring', 'innovasjon'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Produktnavngenerator | Innhold.AI',
    description: 'Skap unike og minneverdige produktnavn med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/product-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Produktnavngenerator | Innhold.AI',
    description: 'Skap unike og minneverdige produktnavn med vår AI-drevne generator.',
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

export default function ProductNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
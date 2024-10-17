import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Takkebrevgenerator',
  description: 'Bruk vår AI-drevne takkebrevgenerator for å lage personlige og hjertelige takkebrev. Perfekt for alle anledninger, enten det er bryllup, bursdager eller profesjonelle sammenhenger.',
  keywords: ['takkebrev', 'AI', 'generator', 'personlig', 'bryllup', 'bursdag', 'profesjonell'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Takkebrevgenerator | Innhold.AI',
    description: 'Lag personlige og hjertelige takkebrev med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/thank-you-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Takkebrevgenerator | Innhold.AI',
    description: 'Lag personlige og hjertelige takkebrev med vår AI-drevne generator.',
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

export default function ThankYouLetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
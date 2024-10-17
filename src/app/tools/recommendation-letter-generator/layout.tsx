import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Anbefalingsbrevgenerator',
  description: 'Bruk vår AI-drevne anbefalingsbrevgenerator for å lage profesjonelle og personlige anbefalingsbrev. Perfekt for arbeidsgivere, lærere og mentorer som ønsker å skrive effektive anbefalinger.',
  keywords: ['anbefalingsbrev', 'AI', 'generator', 'jobbsøking', 'referanse', 'karriereutvikling'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Anbefalingsbrevgenerator | Innhold.AI',
    description: 'Lag profesjonelle og personlige anbefalingsbrev med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/recommendation-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Anbefalingsbrevgenerator | Innhold.AI',
    description: 'Lag profesjonelle og personlige anbefalingsbrev med vår AI-drevne generator.',
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

export default function RecommendationLetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
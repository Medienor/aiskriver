import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI LinkedIn Anbefalingsgenerator',
  description: 'Bruk vår AI-drevne LinkedIn anbefalingsgenerator for å skape overbevisende og profesjonelle anbefalinger. Perfekt for jobbsøkere, nettverksbyggere og karriereutviklere.',
  keywords: ['LinkedIn', 'anbefalinger', 'AI', 'generator', 'karriere', 'nettverk', 'profesjonell utvikling'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI LinkedIn Anbefalingsgenerator | Innhold.AI',
    description: 'Skap overbevisende og profesjonelle LinkedIn-anbefalinger med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/linkedin-recommendation-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI LinkedIn Anbefalingsgenerator | Innhold.AI',
    description: 'Skap overbevisende og profesjonelle LinkedIn-anbefalinger med vår AI-drevne generator.',
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

export default function LinkedInRecommendationGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
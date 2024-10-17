import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI CV-sammendragsgenerator',
  description: 'Bruk vår AI-drevne CV-sammendragsgenerator for å skape overbevisende og profesjonelle sammendrag for din CV. Perfekt for jobbsøkere som ønsker å fremheve sine nøkkelkvalifikasjoner og erfaringer.',
  keywords: ['CV', 'sammendrag', 'AI', 'jobbsøking', 'karriereutvikling', 'profesjonell profil'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI CV-sammendragsgenerator | Innhold.AI',
    description: 'Skap overbevisende CV-sammendrag med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/resume-summary-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI CV-sammendragsgenerator | Innhold.AI',
    description: 'Skap overbevisende CV-sammendrag med vår AI-drevne generator.',
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

export default function ResumeSummaryGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
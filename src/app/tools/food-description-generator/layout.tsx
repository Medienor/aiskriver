import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Matbeskrivelse-generator',
  description: 'Bruk vår AI-drevne matbeskrivelse-generator for å skape appetittvekkende og detaljerte beskrivelser av matretter. Perfekt for restauranter, matbloggere og matelskere.',
  keywords: ['matbeskrivelse', 'AI', 'generator', 'mat', 'restaurant', 'meny', 'matblogging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Matbeskrivelse-generator | Innhold.AI',
    description: 'Skap fristende matbeskrivelser med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/food-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Matbeskrivelse-generator | Innhold.AI',
    description: 'Skap fristende matbeskrivelser med vår AI-drevne generator.',
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

export default function FoodDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
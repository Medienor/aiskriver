import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Historiesammendrag',
  description: 'Bruk vårt AI-drevne verktøy for å lage sammendrag av historier og tekster. Ideelt for studenter, forfattere og alle som ønsker å effektivt oppsummere innhold.',
  keywords: ['historiesammendrag', 'AI', 'tekstsammendrag', 'oppsummering', 'innholdsanalyse', 'effektiv lesing'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Historiesammendrag | Innhold.AI',
    description: 'Lag raske og presise sammendrag av historier og tekster med vårt AI-drevne verktøy.',
    url: 'https://innhold.ai/tools/story-summarizer',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Historiesammendrag | Innhold.AI',
    description: 'Lag raske og presise sammendrag av historier og tekster med vårt AI-drevne verktøy.',
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

export default function StorySummarizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
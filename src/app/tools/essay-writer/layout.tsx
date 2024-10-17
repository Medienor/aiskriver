import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Essayskriver',
  description: 'Bruk vår AI-drevne essayskriver for å skape velstrukturerte og engasjerende essays. Perfekt for studenter, akademikere og profesjonelle skribenter.',
  keywords: ['essay', 'AI', 'essayskriver', 'akademisk skriving', 'studier', 'kreativ skriving'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Essayskriver | Innhold.AI',
    description: 'Skap velstrukturerte og engasjerende essays med vår AI-drevne essayskriver.',
    url: 'https://innhold.ai/tools/essay-writer',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Essayskriver | Innhold.AI',
    description: 'Skap velstrukturerte og engasjerende essays med vår AI-drevne essayskriver.',
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

export default function EssayWriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
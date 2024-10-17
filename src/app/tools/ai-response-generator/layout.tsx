import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Svar-generator',
  description: 'Bruk vår AI-drevne svar-generator for å skape unike og relevante svar. Effektiviser kommunikasjonen din med intelligent tekstgenerering.',
  keywords: ['AI svar-generator', 'tekstgenerering', 'automatisk svar', 'kommunikasjonsverktøy', 'AI-assistert skriving'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Svar-generator | Innhold.AI',
    description: 'Generer unike og relevante svar med vår AI-drevne svar-generator.',
    url: 'https://innhold.ai/tools/ai-response-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Svar-generator | Innhold.AI',
    description: 'Generer unike og relevante svar med vår AI-drevne svar-generator.',
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

export default function AIResponseGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
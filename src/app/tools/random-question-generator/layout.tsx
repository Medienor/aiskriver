import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Tilfeldig Spørsmålsgenerator',
  description: 'Bruk vår AI-drevne tilfeldige spørsmålsgenerator for å skape engasjerende og varierte spørsmål. Perfekt for lærere, quizmastere og alle som ønsker å stimulere kreativ tenkning og læring.',
  keywords: ['tilfeldig spørsmål', 'AI', 'spørsmålsgenerator', 'quiz', 'læring', 'undervisning'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Tilfeldig Spørsmålsgenerator | Innhold.AI',
    description: 'Generer engasjerende og varierte spørsmål med vår AI-drevne tilfeldige spørsmålsgenerator.',
    url: 'https://innhold.ai/tools/random-question-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Tilfeldig Spørsmålsgenerator | Innhold.AI',
    description: 'Generer engasjerende og varierte spørsmål med vår AI-drevne tilfeldige spørsmålsgenerator.',
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

export default function RandomQuestionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
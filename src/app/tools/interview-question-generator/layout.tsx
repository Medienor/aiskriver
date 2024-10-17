import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Intervju Spørsmål Generator',
  description: 'Bruk vår AI-drevne intervjuspørsmålgenerator for å skape relevante og effektive spørsmål for dine jobbintervjuer. Perfekt for rekrutterere, HR-profesjonelle og jobbsøkere.',
  keywords: ['intervjuspørsmål', 'AI', 'generator', 'rekruttering', 'HR', 'jobbintervju'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Intervju Spørsmål Generator | Innhold.AI',
    description: 'Skap relevante og effektive intervjuspørsmål med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/interview-question-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Interview Question Generator | Innhold.AI',
    description: 'Skap relevante og effektive intervjuspørsmål med vår AI-drevne generator.',
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

export default function InterviewQuestionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
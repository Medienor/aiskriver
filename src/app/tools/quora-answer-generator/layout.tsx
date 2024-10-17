import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Quora Svargenerator',
  description: 'Bruk vår AI-drevne Quora svargenerator for å skape informative og engasjerende svar på Quora-spørsmål. Perfekt for innholdsskapere, markedsførere og eksperter som ønsker å dele kunnskap og øke sin synlighet på plattformen.',
  keywords: ['Quora', 'AI', 'svargenerator', 'innholdsskaping', 'kunnskapsdeling', 'digital markedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Quora Svargenerator | Innhold.AI',
    description: 'Skap informative og engasjerende Quora-svar med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/quora-answer-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Quora Svargenerator | Innhold.AI',
    description: 'Skap informative og engasjerende Quora-svar med vår AI-drevne generator.',
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

export default function QuoraAnswerGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
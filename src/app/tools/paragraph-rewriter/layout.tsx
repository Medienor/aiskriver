import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Avsnittomskriver',
  description: 'Bruk vår AI-drevne avsnittomskriver for å forbedre og omformulere dine tekstavsnitt. Perfekt for forfattere, studenter og innholdsskapere som ønsker å forbedre sin skriving.',
  keywords: ['avsnitt', 'omskriving', 'AI', 'tekstforbedring', 'skriving', 'innholdsproduksjon'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Avsnittomskriver | Innhold.AI',
    description: 'Forbedre og omformuler dine tekstavsnitt med vår AI-drevne avsnittomskriver.',
    url: 'https://innhold.ai/tools/paragraph-rewriter',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Avsnittomskriver | Innhold.AI',
    description: 'Forbedre og omformuler dine tekstavsnitt med vår AI-drevne avsnittomskriver.',
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

export default function ParagraphRewriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Avsnittgenerator',
  description: 'Bruk vår AI-drevne avsnittgenerator for å skape engasjerende og velstrukturerte avsnitt for dine tekster. Perfekt for forfattere, bloggere og innholdsskapere som ønsker å forbedre sin skriving.',
  keywords: ['avsnitt', 'AI', 'generator', 'skriving', 'innholdsproduksjon', 'tekstforbedring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Avsnittgenerator | Innhold.AI',
    description: 'Skap engasjerende og velstrukturerte avsnitt med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/paragraph-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Avsnittgenerator | Innhold.AI',
    description: 'Skap engasjerende og velstrukturerte avsnitt med vår AI-drevne generator.',
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

export default function ParagraphGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
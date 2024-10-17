import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Videotittel-generator',
  description: 'Bruk vår AI-drevne videotittel-generator for å lage fengende og effektive titler for dine videoer. Perfekt for YouTubere, markedsførere og innholdsskapere som ønsker å øke visninger og engasjement.',
  keywords: ['videotittel', 'AI', 'YouTube', 'innholdsskaping', 'SEO', 'videomarkedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Videotittel-generator | Innhold.AI',
    description: 'Lag fengende videotitler med vår AI-drevne generator for økt engasjement og visninger.',
    url: 'https://innhold.ai/tools/video-title-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Videotittel-generator | Innhold.AI',
    description: 'Lag fengende videotitler med vår AI-drevne generator for økt engasjement og visninger.',
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

export default function VideoTitleGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
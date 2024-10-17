import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Video Emne Idégenerator',
  description: 'Bruk vår AI-drevne idégenerator for å finne spennende videoemner. Perfekt for innholdsskapere, YouTubere og markedsførere som ønsker å generere engasjerende videoinnhold.',
  keywords: ['video emner', 'AI', 'idégenerator', 'innholdsskaping', 'YouTube', 'videomarkedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Video Emne Idégenerator | Innhold.AI',
    description: 'Generer engasjerende videoemner med vår AI-drevne idégenerator.',
    url: 'https://innhold.ai/tools/video-topic-ideas-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Video Emne Idégenerator | Innhold.AI',
    description: 'Generer engasjerende videoemner med vår AI-drevne idégenerator.',
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

export default function VideoTopicIdeasGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
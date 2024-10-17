import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI YouTube Tittelgenerator',
  description: 'Bruk vår AI-drevne YouTube tittelgenerator for å lage fengende og effektive titler for dine videoer. Perfekt for innholdsskapere, markedsførere og YouTubere som ønsker å øke visninger og engasjement.',
  keywords: ['YouTube', 'tittelgenerator', 'AI', 'videomarkedsføring', 'innholdsskaping', 'SEO'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI YouTube Tittelgenerator | Innhold.AI',
    description: 'Lag fengende YouTube-titler med vår AI-drevne tittelgenerator.',
    url: 'https://innhold.ai/tools/youtube-title-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI YouTube Tittelgenerator | Innhold.AI',
    description: 'Lag fengende YouTube-titler med vår AI-drevne tittelgenerator.',
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

export default function YouTubeTitleGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
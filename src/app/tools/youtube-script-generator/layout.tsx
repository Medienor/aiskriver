import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI YouTube-manusgenerator',
  description: 'Bruk vår AI-drevne YouTube-manusgenerator for å lage engasjerende og strukturerte manus til dine videoer. Perfekt for innholdsskapere, markedsførere og YouTubere som ønsker å effektivisere sin innholdsproduksjon.',
  keywords: ['YouTube-manus', 'AI', 'videomanus', 'innholdsproduksjon', 'YouTube-innhold', 'manusgenerator'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI YouTube-manusgenerator | Innhold.AI',
    description: 'Lag engasjerende YouTube-manus med vår AI-drevne manusgenerator.',
    url: 'https://innhold.ai/tools/youtube-script-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI YouTube-manusgenerator | Innhold.AI',
    description: 'Lag engasjerende YouTube-manus med vår AI-drevne manusgenerator.',
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

export default function YouTubeScriptGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI YouTube Beskrivelse Generator',
  description: 'Bruk vår AI-drevne YouTube beskrivelse generator for å lage engasjerende og SEO-vennlige videobeskrivelser. Perfekt for YouTubere, markedsførere og innholdsskapere som ønsker å optimalisere sine videoer.',
  keywords: ['YouTube', 'beskrivelse generator', 'AI', 'videobeskrivelser', 'SEO', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI YouTube Beskrivelse Generator | Innhold.AI',
    description: 'Lag engasjerende og SEO-vennlige YouTube-beskrivelser med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/youtube-description-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI YouTube Beskrivelse Generator | Innhold.AI',
    description: 'Lag engasjerende og SEO-vennlige YouTube-beskrivelser med vår AI-drevne generator.',
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

export default function YouTubeDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
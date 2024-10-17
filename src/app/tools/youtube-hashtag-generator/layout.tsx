import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'YouTube Hashtag Generator | Innhold.AI',
  description: 'Generer effektive hashtags for YouTube-videoene dine med vårt AI-drevne verktøy. Øk synligheten og engasjementet for innholdet ditt.',
  keywords: ['YouTube', 'hashtags', 'AI', 'videomarkedsføring', 'innholdsskaping', 'SEO'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'YouTube Hashtag Generator | Innhold.AI',
    description: 'Boost synligheten av YouTube-videoene dine med vårt AI-drevne hashtag-generatorverktøy.',
    url: 'https://innhold.ai/tools/youtube-hashtag-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'YouTube Hashtag Generator | Innhold.AI',
    description: 'Boost synligheten av YouTube-videoene dine med vårt AI-drevne hashtag-generatorverktøy.',
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

export default function YouTubeHashtagGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
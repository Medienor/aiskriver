import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TikTok Hashtag Generator | Innhold.AI',
  description: 'Generer effektive TikTok-hashtags med vårt AI-drevne verktøy. Øk rekkevidden og engasjementet for dine TikTok-videoer med relevante og trendende hashtags.',
  keywords: ['TikTok', 'hashtags', 'generator', 'AI', 'sosiale medier', 'innholdsskaping', 'videomarkedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'TikTok Hashtag Generator | Innhold.AI',
    description: 'Boost dine TikTok-videoer med AI-genererte, relevante hashtags.',
    url: 'https://innhold.ai/tools/tiktok-hashtag-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TikTok Hashtag Generator | Innhold.AI',
    description: 'Boost dine TikTok-videoer med AI-genererte, relevante hashtags.',
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

export default function TikTokHashtagGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
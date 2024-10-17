import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI YouTube Tag Generator | Innhold.AI',
  description: 'Bruk vår AI-drevne YouTube Tag Generator for å skape effektive og relevante tagger for dine videoer. Perfekt for innholdsskapere som ønsker å øke synligheten og engasjementet på YouTube.',
  keywords: ['YouTube', 'tagger', 'AI', 'videoptimalisering', 'SEO', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI YouTube Tag Generator | Innhold.AI',
    description: 'Generer effektive YouTube-tagger med vår AI-drevne verktøy for å øke videoens synlighet.',
    url: 'https://innhold.ai/tools/youtube-tag-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI YouTube Tag Generator | Innhold.AI',
    description: 'Generer effektive YouTube-tagger med vår AI-drevne verktøy for å øke videoens synlighet.',
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

export default function YouTubeTagGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
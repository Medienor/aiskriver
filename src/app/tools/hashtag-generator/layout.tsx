import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Hashtag Generator',
  description: 'Bruk vår AI-drevne hashtaggenerator for å skape relevante og effektive hashtags for dine sosiale medieinnlegg. Perfekt for markedsførere, innholdsskapere og sosiale medieentusiaster.',
  keywords: ['hashtags', 'AI', 'generator', 'sosiale medier', 'markedsføring', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Hashtag Generator | Innhold.AI',
    description: 'Skap relevante og effektive hashtags med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/hashtag-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Hashtag Generator | Innhold.AI',
    description: 'Skap relevante og effektive hashtags med vår AI-drevne generator.',
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

export default function HashtagGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Tweet- og Trådgenerator',
  description: 'Bruk vår AI-drevne tweet- og trådgenerator for å skape engasjerende innhold for sosiale medier. Perfekt for markedsførere, influensere og bedrifter som ønsker å forbedre sin tilstedeværelse på Twitter.',
  keywords: ['tweet', 'tråd', 'AI', 'sosiale medier', 'innholdsskaping', 'Twitter', 'markedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Tweet- og Trådgenerator | Innhold.AI',
    description: 'Skap engasjerende tweets og tråder med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/tweet-and-threads-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Tweet- og Trådgenerator | Innhold.AI',
    description: 'Skap engasjerende tweets og tråder med vår AI-drevne generator.',
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

export default function TweetAndThreadsGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
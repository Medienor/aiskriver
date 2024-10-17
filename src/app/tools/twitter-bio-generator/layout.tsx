import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Twitter Bio Generator',
  description: 'Lag en fengende Twitter-bio med vårt AI-drevne verktøy. Perfekt for personlige og profesjonelle profiler som ønsker å skille seg ut på Twitter.',
  keywords: ['Twitter', 'bio', 'AI', 'profilgenerator', 'sosiale medier', 'personlig merkevarebygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Twitter Bio Generator | Innhold.AI',
    description: 'Skap en unik Twitter-bio med vårt AI-drevne verktøy.',
    url: 'https://innhold.ai/tools/twitter-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Twitter Bio Generator | Innhold.AI',
    description: 'Skap en unik Twitter-bio med vårt AI-drevne verktøy.',
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

export default function TwitterBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Talegenerator',
  description: 'Bruk vår AI-drevne talegenerator for å skape overbevisende og engasjerende taler. Perfekt for ledere, talere og alle som ønsker å levere kraftfulle budskap.',
  keywords: ['tale', 'AI', 'generator', 'offentlig tale', 'presentasjon', 'retorikk'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Talegenerator | Innhold.AI',
    description: 'Skap overbevisende og engasjerende taler med vår AI-drevne talegenerator.',
    url: 'https://innhold.ai/tools/speech-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Talegenerator | Innhold.AI',
    description: 'Skap overbevisende og engasjerende taler med vår AI-drevne talegenerator.',
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

export default function SpeechGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Kjærlighetsbrev Generator',
  description: 'Bruk vår AI-drevne kjærlighetsbrev generator for å skape romantiske og personlige kjærlighetsbrev. Perfekt for de som ønsker å uttrykke sine følelser på en unik måte.',
  keywords: ['kjærlighetsbrev', 'AI', 'generator', 'romantikk', 'personlig', 'følelser'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Kjærlighetsbrev Generator | Innhold.AI',
    description: 'Skap romantiske og personlige kjærlighetsbrev med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/love-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Kjærlighetsbrev Generator | Innhold.AI',
    description: 'Skap romantiske og personlige kjærlighetsbrev med vår AI-drevne generator.',
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

export default function LoveLetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
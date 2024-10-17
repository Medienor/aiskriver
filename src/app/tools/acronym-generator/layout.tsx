import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Akronymgenerator',
  description: 'Bruk vår AI-drevne akronymgenerator for å lage kreative og minneverdige forkortelser. Perfekt for prosjekter, organisasjoner og merkenavn.',
  keywords: ['akronymgenerator', 'AI', 'forkortelser', 'navngiving', 'kreativitet', 'merkevarebygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Akronymgenerator | Innhold.AI',
    description: 'Lag kreative og minneverdige forkortelser med vår AI-drevne akronymgenerator.',
    url: 'https://innhold.ai/tools/acronym-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Akronymgenerator | Innhold.AI',
    description: 'Lag kreative og minneverdige forkortelser med vår AI-drevne akronymgenerator.',
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

export default function AcronymGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
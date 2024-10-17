import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Setningsutvidelsesverktøy',
  description: 'Bruk vårt AI-drevne setningsutvidelsesverktøy for å berike og utvide dine setninger. Perfekt for forfattere, studenter og innholdsskapere som ønsker å forbedre sin skriving og skape mer detaljert innhold.',
  keywords: ['setningsutvidelse', 'AI', 'tekstforbedring', 'innholdsskaping', 'skrivehjelpemiddel', 'detaljert skriving'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Setningsutvidelsesverktøy | Innhold.AI',
    description: 'Utvid og berik dine setninger med vårt AI-drevne setningsutvidelsesverktøy.',
    url: 'https://innhold.ai/tools/sentence-expander',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Setningsutvidelsesverktøy | Innhold.AI',
    description: 'Utvid og berik dine setninger med vårt AI-drevne setningsutvidelsesverktøy.',
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

export default function SentenceExpanderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI CV-punktgenerator',
  description: 'Bruk vår AI-drevne CV-punktgenerator for å lage imponerende og effektive kulepunkter til din CV. Perfekt for jobbsøkere som ønsker å fremheve sine ferdigheter og prestasjoner.',
  keywords: ['CV', 'AI', 'kulepunkter', 'jobbsøking', 'karriereutvikling', 'CV-optimalisering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI CV-punktgenerator | Innhold.AI',
    description: 'Lag imponerende CV-kulepunkter med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/resume-bullet-point-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI CV-punktgenerator | Innhold.AI',
    description: 'Lag imponerende CV-kulepunkter med vår AI-drevne generator.',
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

export default function ResumeBulletPointGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
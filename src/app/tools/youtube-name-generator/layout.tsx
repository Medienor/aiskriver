import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Omskrivingsverktøy',
  description: 'Bruk vårt AI-drevne omskrivingsverktøy for å forbedre og variere tekstinnholdet ditt. Perfekt for forfattere, studenter og innholdsskapere som ønsker å unngå plagiering og forbedre sin skriving.',
  keywords: ['omskriving', 'AI', 'parafrasering', 'tekstforbedring', 'innholdsskaping', 'plagiatkontroll'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Omskrivingsverktøy | Innhold.AI',
    description: 'Forbedre og varier tekstinnholdet ditt med vårt AI-drevne omskrivingsverktøy.',
    url: 'https://innhold.ai/tools/paraphrasing-tool',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Omskrivingsverktøy | Innhold.AI',
    description: 'Forbedre og varier tekstinnholdet ditt med vårt AI-drevne omskrivingsverktøy.',
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

export default function ParaphrasingToolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
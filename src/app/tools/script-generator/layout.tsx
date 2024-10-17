import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Skriptgenerator',
  description: 'Bruk vår AI-drevne skriptgenerator for å lage effektive og engasjerende skript. Perfekt for markedsførere, innholdsskapere og bedrifter som ønsker å forbedre sin kommunikasjon.',
  keywords: ['skriptgenerator', 'AI', 'innholdsproduksjon', 'markedsføring', 'kommunikasjon', 'automatisering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Skriptgenerator | Innhold.AI',
    description: 'Lag effektive og engasjerende skript med vår AI-drevne skriptgenerator.',
    url: 'https://innhold.ai/tools/script-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Skriptgenerator | Innhold.AI',
    description: 'Lag effektive og engasjerende skript med vår AI-drevne skriptgenerator.',
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

export default function ScriptGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
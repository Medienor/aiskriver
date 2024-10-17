import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Annonsetekst-generator',
  description: 'Bruk vår AI-drevne annonsetekst-generator for å skape overbevisende og effektive annonser. Øk konverteringer med skreddersydde annonsetekster.',
  keywords: ['annonsetekst-generator', 'AI', 'markedsføring', 'konverteringer', 'annonser', 'tekstforfatter'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Annonsetekst-generator | Innhold.AI',
    description: 'Skap overbevisende annonsetekster med vår AI-drevne generator for økte konverteringer.',
    url: 'https://innhold.ai/tools/ad-copy-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Annonsetekst-generator | Innhold.AI',
    description: 'Skap overbevisende annonsetekster med vår AI-drevne generator for økte konverteringer.',
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

export default function AdCopyGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Annonseoverskrift-generator',
  description: 'Bruk vår AI-drevne annonseoverskrift-generator for å skape engasjerende og effektive overskrifter. Øk konverteringer med overbevisende annonsetekster.',
  keywords: ['annonseoverskrift', 'AI', 'generator', 'markedsføring', 'konvertering', 'annonsering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Annonseoverskrift-generator | Innhold.AI',
    description: 'Skap engasjerende annonseoverskrifter med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/ad-headline-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Annonseoverskrift-generator | Innhold.AI',
    description: 'Skap engasjerende annonseoverskrifter med vår AI-drevne generator.',
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

export default function AdHeadlineGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
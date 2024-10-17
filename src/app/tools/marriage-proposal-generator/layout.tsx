import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Frieri Generator',
  description: 'Bruk vår AI-drevne frierigenerator for å skape romantiske og personlige frieritekster. Perfekt for par som ønsker å ta forholdet til neste nivå på en unik og minneverdig måte.',
  keywords: ['frieri', 'AI', 'generator', 'romantikk', 'ekteskap', 'kjærlighet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Frieri Generator | Innhold.AI',
    description: 'Skap romantiske og personlige frieritekster med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/marriage-proposal-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Frieri Generator | Innhold.AI',
    description: 'Skap romantiske og personlige frieritekster med vår AI-drevne generator.',
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

export default function MarriageProposalGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
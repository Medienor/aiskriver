import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Cold Email Generator',
  description: 'Bruk vår AI-drevne cold email generator for å skape effektive og overbevisende cold emails. Øk dine sjanser for suksess med personaliserte og målrettede meldinger.',
  keywords: ['cold email', 'AI', 'email-generator', 'salgsverktøy', 'lead generation', 'forretningsutvikling'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Cold Email Generator | Innhold.AI',
    description: 'Skap effektive og overbevisende cold emails med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/cold-email-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Cold Email Generator | Innhold.AI',
    description: 'Skap effektive og overbevisende cold emails med vår AI-drevne generator.',
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

export default function ColdEmailGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
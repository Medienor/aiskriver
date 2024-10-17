import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Bumble Bio-generator',
  description: 'Bruk vår AI-drevne Bumble bio-generator for å skape unike og engasjerende Bumble-profiler. Fremhev dine beste egenskaper og interesser effektivt.',
  keywords: ['Bumble', 'bio', 'AI', 'profil-generator', 'dating-app', 'personlig presentasjon', 'online dating'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Bumble Bio-generator | Innhold.AI',
    description: 'Skap unike og engasjerende Bumble-profiler med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/bumble-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Bumble Bio-generator | Innhold.AI',
    description: 'Skap unike og engasjerende Bumble-profiler med vår AI-drevne generator.',
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

export default function BumbleBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
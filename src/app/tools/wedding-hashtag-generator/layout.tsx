import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Bryllupshashtag-generator',
  description: 'Lag unike og morsomme bryllupshashtags med vår AI-drevne generator. Perfekt for par som ønsker å skape en minneverdig og personlig hashtag for sin store dag.',
  keywords: ['bryllup', 'hashtag', 'AI', 'generator', 'personlig', 'sosiale medier', 'bryllupstrend'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Bryllupshashtag-generator | Innhold.AI',
    description: 'Skap den perfekte bryllupshashtagen med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/wedding-hashtag-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Bryllupshashtag-generator | Innhold.AI',
    description: 'Skap den perfekte bryllupshashtagen med vår AI-drevne generator.',
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

export default function WeddingHashtagGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Snapchat Bio Generator',
  description: 'Bruk vår AI-drevne Snapchat bio generator for å lage kreative og engasjerende biografier. Perfekt for Snapchat-brukere som ønsker å skille seg ut og tiltrekke flere følgere.',
  keywords: ['Snapchat', 'bio', 'generator', 'AI', 'sosiale medier', 'profil', 'kreativitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Snapchat Bio Generator | Innhold.AI',
    description: 'Lag unike og fengende Snapchat-biografier med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/snapchat-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Snapchat Bio Generator | Innhold.AI',
    description: 'Lag unike og fengende Snapchat-biografier med vår AI-drevne generator.',
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

export default function SnapchatBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Pinterest Bio Generator',
  description: 'Bruk vår AI-drevne Pinterest bio generator for å lage engasjerende og unike biografier for din Pinterest-profil. Perfekt for innholdsskapere, bedrifter og influensere som ønsker å skille seg ut på Pinterest.',
  keywords: ['Pinterest', 'bio', 'generator', 'AI', 'profiloptimalisering', 'sosiale medier', 'markedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Pinterest Bio Generator | Innhold.AI',
    description: 'Lag engasjerende Pinterest-biografier med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/pinterest-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Pinterest Bio Generator | Innhold.AI',
    description: 'Lag engasjerende Pinterest-biografier med vår AI-drevne generator.',
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

export default function PinterestBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
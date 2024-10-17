import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TikTok Bio Generator | Innhold.AI',
  description: 'Lag engasjerende og kreative TikTok-bioer med vår AI-drevne generator. Perfekt for influencere, merkevarer og alle som ønsker å skille seg ut på TikTok.',
  keywords: ['TikTok', 'bio generator', 'AI', 'sosiale medier', 'innholdsskaping', 'personlig merkevarebygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'TikTok Bio Generator | Innhold.AI',
    description: 'Skap unike og fengende TikTok-bioer med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/tiktok-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TikTok Bio Generator | Innhold.AI',
    description: 'Skap unike og fengende TikTok-bioer med vår AI-drevne generator.',
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

export default function TikTokBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
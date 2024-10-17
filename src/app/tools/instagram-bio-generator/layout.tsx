import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Instagram Bio Generator',
  description: 'Bruk vår AI-drevne Instagram bio-generator for å skape engasjerende og effektive biografier for din Instagram-profil. Perfekt for influencere, merkevarer og sosiale medieentusiaster.',
  keywords: ['Instagram bio', 'AI', 'generator', 'sosiale medier', 'personlig merkevarebygging', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Instagram Bio Generator | Innhold.AI',
    description: 'Skap engasjerende og effektive Instagram-biografier med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/instagram-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Instagram Bio Generator | Innhold.AI',
    description: 'Skap engasjerende og effektive Instagram-biografier med vår AI-drevne generator.',
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

export default function InstagramBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
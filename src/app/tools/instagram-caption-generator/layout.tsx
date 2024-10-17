import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Instagram Caption Generator',
  description: 'Bruk vår AI-drevne Instagram caption-generator for å skape engasjerende og effektive bildetekster for dine Instagram-innlegg. Perfekt for influencere, merkevarer og sosiale medieentusiaster.',
  keywords: ['Instagram', 'caption', 'AI', 'generator', 'sosiale medier', 'markedsføring', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Instagram Caption Generator | Innhold.AI',
    description: 'Skap engasjerende og effektive Instagram-bildetekster med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/instagram-caption-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Instagram Caption Generator | Innhold.AI',
    description: 'Skap engasjerende og effektive Instagram-bildetekster med vår AI-drevne generator.',
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

export default function InstagramCaptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
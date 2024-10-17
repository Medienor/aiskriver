import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI TikTok Tekst Generator',
  description: 'Bruk vår AI-drevne TikTok tekst generator for å lage engasjerende og kreative tekster til dine TikTok-videoer. Perfekt for innholdsskapere som ønsker å øke sin synlighet og engasjement på plattformen.',
  keywords: ['TikTok', 'AI', 'tekstgenerator', 'videoinnhold', 'sosiale medier', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI TikTok Tekst Generator | Innhold.AI',
    description: 'Lag engasjerende TikTok-tekster med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/tiktok-caption-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI TikTok Tekst Generator | Innhold.AI',
    description: 'Lag engasjerende TikTok-tekster med vår AI-drevne generator.',
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

export default function TikTokCaptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
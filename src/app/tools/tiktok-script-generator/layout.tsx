import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI TikTok Manus Generator',
  description: 'Bruk vår AI-drevne TikTok manus generator for å lage engasjerende og virale videoinnhold. Perfekt for innholdsskapere, markedsførere og TikTok-entusiaster som ønsker å øke sin tilstedeværelse på plattformen.',
  keywords: ['TikTok', 'AI', 'manusgenerator', 'videoinnhold', 'innholdsskaping', 'sosiale medier'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI TikTok Manus Generator | Innhold.AI',
    description: 'Lag engasjerende TikTok-innhold med vår AI-drevne manusgenerator.',
    url: 'https://innhold.ai/tools/tiktok-script-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI TikTok Manus Generator | Innhold.AI',
    description: 'Lag engasjerende TikTok-innhold med vår AI-drevne manusgenerator.',
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

export default function TikTokScriptGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
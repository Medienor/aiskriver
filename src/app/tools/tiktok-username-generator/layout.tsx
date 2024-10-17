import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TikTok Brukernavn Generator',
  description: 'Bruk vår AI-drevne TikTok brukernavn generator for å lage unike og kreative brukernavnforslag. Perfekt for nye TikTok-brukere eller de som ønsker å fornye sin profil.',
  keywords: ['TikTok', 'brukernavn', 'generator', 'AI', 'sosiale medier', 'kreativitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'TikTok Brukernavn Generator | Innhold.AI',
    description: 'Lag unike og kreative TikTok brukernavnforslag med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/tiktok-username-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'TikTok Brukernavn Generator | Innhold.AI',
    description: 'Lag unike og kreative TikTok brukernavnforslag med vår AI-drevne generator.',
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

export default function TikTokUsernameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
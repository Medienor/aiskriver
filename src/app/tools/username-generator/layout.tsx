import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Brukernavn Generator',
  description: 'Bruk vår AI-drevne brukernavn generator for å lage unike og kreative brukernavn. Perfekt for nye brukere på sosiale medier, gamere, eller de som ønsker å fornye sin online identitet.',
  keywords: ['brukernavn', 'generator', 'AI', 'sosiale medier', 'gaming', 'online identitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Brukernavn Generator | Innhold.AI',
    description: 'Lag unike og kreative brukernavn med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/username-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Brukernavn Generator | Innhold.AI',
    description: 'Lag unike og kreative brukernavn med vår AI-drevne generator.',
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

export default function UsernameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
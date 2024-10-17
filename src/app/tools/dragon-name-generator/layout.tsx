import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Dragenavngenerator',
  description: 'Bruk vår AI-drevne dragenavngenerator for å skape unike og kraftfulle navn til drager. Perfekt for forfattere, spillere og fantasientusiaster.',
  keywords: ['dragenavn', 'AI', 'navngenerator', 'fantasy', 'drager', 'kreativ skriving'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Dragenavngenerator | Innhold.AI',
    description: 'Skap unike og kraftfulle dragenavn med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/dragon-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Dragenavngenerator | Innhold.AI',
    description: 'Skap unike og kraftfulle dragenavn med vår AI-drevne generator.',
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

export default function DragonNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
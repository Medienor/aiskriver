import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Domenenavn-generator',
  description: 'Bruk vår AI-drevne domenenavn-generator for å skape unike og minneverdige domenenavn. Finn det perfekte domenet for din nettside eller bedrift.',
  keywords: ['domenenavn', 'AI', 'domene-generator', 'nettside', 'merkevarebygging', 'online tilstedeværelse'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Domenenavn-generator | Innhold.AI',
    description: 'Skap unike og minneverdige domenenavn med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/domain-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Domenenavn-generator | Innhold.AI',
    description: 'Skap unike og minneverdige domenenavn med vår AI-drevne generator.',
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

export default function DomainNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
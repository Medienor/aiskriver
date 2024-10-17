import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Bedriftsnavngenerator',
  description: 'Bruk vår AI-drevne bedriftsnavngenerator for å skape unike og minneverdige navn til din virksomhet. Få kreative forslag tilpasset din bransje.',
  keywords: ['bedriftsnavn', 'AI', 'generator', 'navngiving', 'merkevarebygging', 'oppstart'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Bedriftsnavngenerator | Innhold.AI',
    description: 'Skap unike og minneverdige bedriftsnavn med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/ai-business-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Bedriftsnavngenerator | Innhold.AI',
    description: 'Skap unike og minneverdige bedriftsnavn med vår AI-drevne generator.',
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

export default function AIBusinessNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
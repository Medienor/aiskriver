import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Bedriftsnavn-generator',
  description: 'Bruk vår AI-drevne bedriftsnavn-generator for å skape unike og minneverdige navn for din virksomhet. Få kreative forslag som passer din bransje og visjon.',
  keywords: ['bedriftsnavn', 'AI', 'navn-generator', 'merkevarebygging', 'oppstart', 'forretningsidentitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Bedriftsnavn-generator | Innhold.AI',
    description: 'Skap unike og minneverdige bedriftsnavn med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/business-name-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Bedriftsnavn-generator | Innhold.AI',
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

export default function BusinessNameGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Lorem Ipsum Generator',
  description: 'Bruk vår AI-drevne Lorem Ipsum generator for å skape unikt og tilpasset fylltekst for dine prosjekter. Perfekt for designere, utviklere og innholdsskapere.',
  keywords: ['lorem ipsum', 'AI', 'generator', 'fylltekst', 'design', 'utvikling', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Lorem Ipsum Generator | Innhold.AI',
    description: 'Skap unikt og tilpasset fylltekst med vår AI-drevne Lorem Ipsum generator.',
    url: 'https://innhold.ai/tools/lorem-ipsum-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Lorem Ipsum Generator | Innhold.AI',
    description: 'Skap unikt og tilpasset fylltekst med vår AI-drevne Lorem Ipsum generator.',
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

export default function LoremIpsumGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
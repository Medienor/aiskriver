import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Slagordgenerator',
  description: 'Bruk vår AI-drevne slagordgenerator for å skape fengende og minneverdige slagord for din bedrift eller merkevare. Perfekt for markedsførere, gründere og bedriftseiere som ønsker å skille seg ut i markedet.',
  keywords: ['slagord', 'AI', 'generator', 'merkevarebygging', 'markedsføring', 'bedriftsidentitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Slagordgenerator | Innhold.AI',
    description: 'Skap unike og effektive slagord for din bedrift med vår AI-drevne slagordgenerator.',
    url: 'https://innhold.ai/tools/slogan-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Slagordgenerator | Innhold.AI',
    description: 'Skap unike og effektive slagord for din bedrift med vår AI-drevne slagordgenerator.',
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

export default function SloganGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
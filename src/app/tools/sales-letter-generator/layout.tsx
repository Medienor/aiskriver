import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Salgsbrevgenerator',
  description: 'Bruk vår AI-drevne salgsbrevgenerator for å skape overbevisende og effektive salgsbrev. Perfekt for markedsførere, selgere og bedriftseiere som ønsker å øke konverteringer og salg.',
  keywords: ['salgsbrev', 'AI', 'markedsføring', 'konvertering', 'salgsskriving', 'copywriting'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Salgsbrevgenerator | Innhold.AI',
    description: 'Skap overbevisende salgsbrev med vår AI-drevne salgsbrevgenerator.',
    url: 'https://innhold.ai/tools/sales-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Salgsbrevgenerator | Innhold.AI',
    description: 'Skap overbevisende salgsbrev med vår AI-drevne salgsbrevgenerator.',
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

export default function SalesLetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Diktgenerator',
  description: 'Bruk vår AI-drevne diktgenerator for å skape unike og inspirerende dikt. Perfekt for poeter, forfattere og kreative sjeler som ønsker å utforske nye poetiske uttrykk.',
  keywords: ['dikt', 'AI', 'poesi', 'kreativ skriving', 'diktgenerator', 'litteratur'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Diktgenerator | Innhold.AI',
    description: 'Skap unike og inspirerende dikt med vår AI-drevne diktgenerator.',
    url: 'https://innhold.ai/tools/poem-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Diktgenerator | Innhold.AI',
    description: 'Skap unike og inspirerende dikt med vår AI-drevne diktgenerator.',
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

export default function PoemGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI CV-målsettingsgenerator',
  description: 'Bruk vår AI-drevne CV-målsettingsgenerator for å skape overbevisende og profesjonelle målsettinger for din CV. Perfekt for jobbsøkere som ønsker å skille seg ut i søknadsprosessen.',
  keywords: ['CV', 'målsetting', 'AI', 'jobbsøking', 'karriereutvikling', 'profesjonell utvikling'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI CV-målsettingsgenerator | Innhold.AI',
    description: 'Skap overbevisende CV-målsettinger med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/resume-objectives-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI CV-målsettingsgenerator | Innhold.AI',
    description: 'Skap overbevisende CV-målsettinger med vår AI-drevne generator.',
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

export default function ResumeObjectivesGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
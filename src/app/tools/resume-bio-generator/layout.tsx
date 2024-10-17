import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI CV og Bio Generator',
  description: 'Bruk vår AI-drevne CV og bio generator for å lage profesjonelle og overbevisende jobbsøknader. Perfekt for jobbsøkere, karriereskiftere og profesjonelle som ønsker å fremheve sine ferdigheter og erfaringer.',
  keywords: ['CV generator', 'bio generator', 'AI', 'jobbsøknad', 'karriereutvikling', 'profesjonell profil'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI CV og Bio Generator | Innhold.AI',
    description: 'Lag imponerende CVer og profesjonelle bios med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/resume-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI CV og Bio Generator | Innhold.AI',
    description: 'Lag imponerende CVer og profesjonelle bios med vår AI-drevne generator.',
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

export default function ResumeBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Oppsigelsesbrevsverktøy',
  description: 'Bruk vårt AI-drevne verktøy for å generere profesjonelle og personlige oppsigelsesbrever. Perfekt for arbeidstakere som ønsker å avslutte sitt arbeidsforhold på en respektfull og effektiv måte.',
  keywords: ['oppsigelse', 'AI', 'oppsigelsebrev', 'jobbavslutning', 'karriereendring', 'profesjonell kommunikasjon'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Oppsigelsesbrevsverktøy | Innhold.AI',
    description: 'Generer profesjonelle og personlige oppsigelsesbrever med vårt AI-drevne verktøy.',
    url: 'https://innhold.ai/tools/resignation-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Oppsigelsesbrevsverktøy | Innhold.AI',
    description: 'Generer profesjonelle og personlige oppsigelsesbrever med vårt AI-drevne verktøy.',
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

export default function ResignationLetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Oppsigelsesbrevsgenerator',
  description: 'Bruk vår AI-drevne oppsigelsesbrevsgenerator for å lage profesjonelle og korrekte oppsigelsesbrever. Perfekt for arbeidsgivere og HR-personell som trenger å håndtere oppsigelser på en respektfull og juridisk korrekt måte.',
  keywords: ['oppsigelse', 'AI', 'brevgenerator', 'HR', 'arbeidsrett', 'personalledelse'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Oppsigelsesbrevsgenerator | Innhold.AI',
    description: 'Lag profesjonelle og korrekte oppsigelsesbrever med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/termination-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Oppsigelsesbrevsgenerator | Innhold.AI',
    description: 'Lag profesjonelle og korrekte oppsigelsesbrever med vår AI-drevne generator.',
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

export default function TerminationLetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
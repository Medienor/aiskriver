import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI LinkedIn Overskrift Generator',
  description: 'Bruk vår AI-drevne LinkedIn overskriftgenerator for å skape profesjonelle og effektive overskrifter for din LinkedIn-profil. Perfekt for jobbsøkere, nettverksbyggere og karriereorienterte personer.',
  keywords: ['LinkedIn', 'overskrift', 'AI', 'generator', 'karriere', 'profesjonell profil', 'nettverksbygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI LinkedIn Overskrift Generator | Innhold.AI',
    description: 'Skap profesjonelle og effektive LinkedIn-overskrifter med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/linkedin-headline-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI LinkedIn Overskrift Generator | Innhold.AI',
    description: 'Skap profesjonelle og effektive LinkedIn-overskrifter med vår AI-drevne generator.',
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

export default function LinkedInHeadlineGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
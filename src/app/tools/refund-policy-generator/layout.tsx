import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Refusjonspolicy Generator',
  description: 'Bruk vår AI-drevne refusjonspolicy generator for å lage en skreddersydd og profesjonell refusjonspolicy for din bedrift. Perfekt for nettbutikker, tjenesteleverandører og andre virksomheter som ønsker å sikre klarhet og tillit i sine kundeforhold.',
  keywords: ['refusjonspolicy', 'AI', 'generator', 'nettbutikk', 'kundeservice', 'forretningsvilkår'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Refusjonspolicy Generator | Innhold.AI',
    description: 'Lag en profesjonell refusjonspolicy for din bedrift med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/refund-policy-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Refusjonspolicy Generator | Innhold.AI',
    description: 'Lag en profesjonell refusjonspolicy for din bedrift med vår AI-drevne generator.',
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

export default function RefundPolicyGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
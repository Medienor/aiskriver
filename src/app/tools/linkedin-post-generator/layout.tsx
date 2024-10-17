import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI LinkedIn Innleggsgenerator',
  description: 'Bruk vår AI-drevne LinkedIn innleggsgenerator for å skape engasjerende og profesjonelle innlegg. Perfekt for nettverksbygging, merkevarebygging og karriereutvikling.',
  keywords: ['LinkedIn', 'AI', 'innleggsgenerator', 'profesjonelt nettverk', 'karriereutvikling', 'merkevarebygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI LinkedIn Innleggsgenerator | Innhold.AI',
    description: 'Skap engasjerende og profesjonelle LinkedIn-innlegg med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/linkedin-post-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI LinkedIn Innleggsgenerator | Innhold.AI',
    description: 'Skap engasjerende og profesjonelle LinkedIn-innlegg med vår AI-drevne generator.',
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

export default function LinkedInPostGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
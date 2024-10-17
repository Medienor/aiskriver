import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI LinkedIn Bio Generator',
  description: 'Bruk vår AI-drevne LinkedIn bio-generator for å skape profesjonelle og effektive biografier for din LinkedIn-profil. Perfekt for jobbsøkere, nettverksbyggere og karriereorienterte fagfolk.',
  keywords: ['LinkedIn bio', 'AI', 'generator', 'profesjonelt nettverk', 'karriereutvikling', 'personlig merkevarebygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI LinkedIn Bio Generator | Innhold.AI',
    description: 'Skap profesjonelle og effektive LinkedIn-biografier med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/linkedin-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI LinkedIn Bio Generator | Innhold.AI',
    description: 'Skap profesjonelle og effektive LinkedIn-biografier med vår AI-drevne generator.',
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

export default function LinkedInBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
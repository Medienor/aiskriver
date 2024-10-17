import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Brevgenerator',
  description: 'Bruk vår AI-drevne brevgenerator for å skape profesjonelle og personlige brev. Spar tid og skap imponerende korrespondanse.',
  keywords: ['brevgenerator', 'AI', 'korrespondanse', 'profesjonelle brev', 'personlige brev', 'skriveassistent'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Brevgenerator | Innhold.AI',
    description: 'Skap profesjonelle og personlige brev med vår AI-drevne brevgenerator.',
    url: 'https://innhold.ai/tools/ai-letter-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Brevgenerator | Innhold.AI',
    description: 'Skap profesjonelle og personlige brev med vår AI-drevne brevgenerator.',
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

export default function AILetterGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
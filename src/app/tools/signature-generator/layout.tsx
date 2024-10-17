import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Signatur-generator',
  description: 'Lag profesjonelle e-postsignaturer enkelt med vår AI-drevne signatur-generator. Perfekt for bedrifter og enkeltpersoner som ønsker å skape et konsistent og profesjonelt image.',
  keywords: ['signatur-generator', 'AI', 'e-postsignatur', 'profesjonell signatur', 'bedriftskommunikasjon', 'personlig branding'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Signatur-generator | Innhold.AI',
    description: 'Skap profesjonelle e-postsignaturer med vår AI-drevne signatur-generator.',
    url: 'https://innhold.ai/tools/signature-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Signatur-generator | Innhold.AI',
    description: 'Skap profesjonelle e-postsignaturer med vår AI-drevne signatur-generator.',
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

export default function SignatureGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
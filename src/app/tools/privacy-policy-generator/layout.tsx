import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Personvernpolicy Generator',
  description: 'Bruk vår AI-drevne personvernpolicy generator for å enkelt lage en skreddersydd personvernerklæring for din nettside eller app. Ideell for bedriftseiere, utviklere og entreprenører som ønsker å sikre overholdelse av personvernlovgivning.',
  keywords: ['personvernpolicy', 'AI', 'generator', 'GDPR', 'personvern', 'personvernerklæring', 'nettside', 'app'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Personvernpolicy Generator | Innhold.AI',
    description: 'Lag en skreddersydd personvernerklæring enkelt med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/privacy-policy-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Personvernpolicy Generator | Innhold.AI',
    description: 'Lag en skreddersydd personvernerklæring enkelt med vår AI-drevne generator.',
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

export default function PrivacyPolicyGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
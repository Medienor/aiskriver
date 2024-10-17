import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Markedsførings-e-postgenerator',
  description: 'Bruk vår AI-drevne markedsførings-e-postgenerator for å skape engasjerende og effektive e-poster for dine markedsføringskampanjer. Perfekt for markedsførere, bedriftseiere og digitale strateger.',
  keywords: ['markedsføring', 'e-post', 'AI', 'generator', 'kampanjer', 'digital markedsføring', 'innholdsskaping'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Markedsførings-e-postgenerator | Innhold.AI',
    description: 'Skap engasjerende og effektive markedsførings-e-poster med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/marketing-email-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Markedsførings-e-postgenerator | Innhold.AI',
    description: 'Skap engasjerende og effektive markedsførings-e-poster med vår AI-drevne generator.',
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

export default function MarketingEmailGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
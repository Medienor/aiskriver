import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Velkomstepost-generator',
  description: 'Bruk vår AI-drevne velkomstepost-generator for å lage personlige og engasjerende velkomstmeldinger. Perfekt for bedrifter, markedsførere og kundeserviceteam som ønsker å forbedre kundekommunikasjonen.',
  keywords: ['velkomstepost', 'AI', 'e-postgenerator', 'kundeengasjement', 'automatisering', 'personalisering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Velkomstepost-generator | Innhold.AI',
    description: 'Lag personlige og engasjerende velkomstmeldinger med vår AI-drevne e-postgenerator.',
    url: 'https://innhold.ai/tools/welcome-email-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Velkomstepost-generator | Innhold.AI',
    description: 'Lag personlige og engasjerende velkomstmeldinger med vår AI-drevne e-postgenerator.',
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

export default function WelcomeEmailGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
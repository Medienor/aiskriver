import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Pressemeldingsgenerator',
  description: 'Bruk vår AI-drevne pressemeldingsgenerator for å skape profesjonelle og effektive pressemeldinger. Perfekt for bedrifter, PR-byråer og markedsførere som ønsker å formidle nyheter og informasjon på en overbevisende måte.',
  keywords: ['pressemelding', 'AI', 'PR', 'bedriftskommunikasjon', 'nyhetsformidling', 'markedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Pressemeldingsgenerator | Innhold.AI',
    description: 'Skap profesjonelle pressemeldinger med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/press-release-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Pressemeldingsgenerator | Innhold.AI',
    description: 'Skap profesjonelle pressemeldinger med vår AI-drevne generator.',
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

export default function PressReleaseGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
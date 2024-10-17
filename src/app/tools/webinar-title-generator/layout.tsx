import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Webinar Tittelgenerator',
  description: 'Bruk vår AI-drevne webinar tittelgenerator for å lage engasjerende og effektive titler for dine webinarer. Perfekt for markedsførere, kursholdere og bedriftsledere som ønsker å tiltrekke flere deltakere.',
  keywords: ['webinar', 'tittelgenerator', 'AI', 'markedsføring', 'kurs', 'engasjement'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Webinar Tittelgenerator | Innhold.AI',
    description: 'Lag engasjerende webinar-titler med vår AI-drevne tittelgenerator.',
    url: 'https://innhold.ai/tools/webinar-title-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Webinar Tittelgenerator | Innhold.AI',
    description: 'Lag engasjerende webinar-titler med vår AI-drevne tittelgenerator.',
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

export default function WebinarTitleGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI E-postskriver',
  description: 'Bruk vår AI-drevne e-postskriver for å skape effektive og overbevisende e-poster. Spar tid og øk engasjement med skreddersydde meldinger.',
  keywords: ['e-postforfatter', 'AI', 'e-postmarkedsføring', 'kommunikasjon', 'innholdsgenerering', 'produktivitet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI E-postskriver | Innhold.AI',
    description: 'Skap effektive og overbevisende e-poster med vår AI-drevne e-postforfatter.',
    url: 'https://innhold.ai/tools/ai-email-writer',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI E-postforfatter | Innhold.AI',
    description: 'Skap effektive og overbevisende e-poster med vår AI-drevne e-postforfatter.',
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

export default function AIEmailWriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
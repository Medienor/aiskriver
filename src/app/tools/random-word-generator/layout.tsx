import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tilfeldig Ordgenerator',
  description: 'Bruk vår tilfeldig ordgenerator for å finne inspirasjon, lage passord eller bare for moro skyld. Perfekt for forfattere, spillutviklere og alle som trenger tilfeldige ord.',
  keywords: ['tilfeldig ord', 'ordgenerator', 'kreativt verktøy', 'inspirasjon', 'passordgenerator', 'språkverktøy'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'Tilfeldig Ordgenerator | Innhold.AI',
    description: 'Generer tilfeldige ord for inspirasjon, passord eller moro med vårt enkle verktøy.',
    url: 'https://innhold.ai/tools/random-word-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Tilfeldig Ordgenerator | Innhold.AI',
    description: 'Generer tilfeldige ord for inspirasjon, passord eller moro med vårt enkle verktøy.',
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

export default function RandomWordGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
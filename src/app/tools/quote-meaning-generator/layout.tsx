import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Sitatbetydningsgenerator',
  description: 'Bruk vår AI-drevne sitatbetydningsgenerator for å utforske og forstå dybden i kjente sitater. Perfekt for studenter, lærere og alle som er interessert i å utdype sin forståelse av visdomsord.',
  keywords: ['sitatbetydning', 'AI', 'sitatanalyse', 'visdomsord', 'litteraturforståelse', 'kulturell innsikt'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Sitatbetydningsgenerator | Innhold.AI',
    description: 'Utforsk og forstå dybden i kjente sitater med vår AI-drevne sitatbetydningsgenerator.',
    url: 'https://innhold.ai/tools/quote-meaning-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Sitatbetydningsgenerator | Innhold.AI',
    description: 'Utforsk og forstå dybden i kjente sitater med vår AI-drevne sitatbetydningsgenerator.',
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

export default function QuoteMeaningGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
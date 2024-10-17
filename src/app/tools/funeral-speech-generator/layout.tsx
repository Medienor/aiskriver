import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Minnetalegenerator',
  description: 'Bruk vår AI-drevne minnetalegenerator for å skape meningsfulle og personlige minnetaler. Perfekt for å hedre og minnes dine kjære.',
  keywords: ['minnetale', 'AI', 'talegenerator', 'begravelse', 'sorgarbeid', 'hedre minnet'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Minnetalegenerator | Innhold.AI',
    description: 'Skap meningsfulle og personlige minnetaler med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/funeral-speech-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Minnetalegenerator | Innhold.AI',
    description: 'Skap meningsfulle og personlige minnetaler med vår AI-drevne generator.',
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

export default function FuneralSpeechGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
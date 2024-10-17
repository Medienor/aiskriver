import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Podcast Manusgenerator',
  description: 'Bruk vår AI-drevne podcast manusgenerator for å skape engasjerende og strukturerte manus for din podcast. Perfekt for podcastere, innholdsskapere og kreative sjeler som ønsker å lage profesjonelle podcaster.',
  keywords: ['podcast manus', 'AI', 'manusgenerator', 'podcastproduksjon', 'innholdsskaping', 'kreativ skriving'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Podcast Manusgenerator | Innhold.AI',
    description: 'Skap engasjerende podcast manus med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/podcast-script-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Podcast Manusgenerator | Innhold.AI',
    description: 'Skap engasjerende podcast manus med vår AI-drevne generator.',
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

export default function PodcastScriptGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
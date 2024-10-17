import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Filmmanuskriptgenerator',
  description: 'Bruk vår AI-drevne filmmanuskriptgenerator for å skape unike og engasjerende filmmanuskripter. Perfekt for manusforfattere, filmskapere og kreative sjeler som ønsker å utforske nye ideer.',
  keywords: ['filmmanuskript', 'AI', 'generator', 'manusforfatter', 'filmproduksjon', 'kreativ skriving'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Filmmanuskriptgenerator | Innhold.AI',
    description: 'Skap unike og engasjerende filmmanuskripter med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/movie-script-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Filmmanuskriptgenerator | Innhold.AI',
    description: 'Skap unike og engasjerende filmmanuskripter med vår AI-drevne generator.',
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

export default function MovieScriptGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
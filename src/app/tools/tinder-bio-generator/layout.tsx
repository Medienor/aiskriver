import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tinder Bio Generator | Innhold.AI',
  description: 'Lag en fengende og unik Tinder-bio med vår AI-drevne generator. Perfekt for singles som ønsker å skille seg ut og tiltrekke seg de rette matchene.',
  keywords: ['Tinder', 'bio generator', 'AI', 'dating', 'profil', 'online dating'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'Tinder Bio Generator | Innhold.AI',
    description: 'Skap en attraktiv Tinder-bio med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/tinder-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Tinder Bio Generator | Innhold.AI',
    description: 'Skap en attraktiv Tinder-bio med vår AI-drevne generator.',
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

export default function TinderBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
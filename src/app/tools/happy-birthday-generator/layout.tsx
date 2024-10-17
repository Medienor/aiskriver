import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Bursdagshilsen-generator',
  description: 'Bruk vår AI-drevne bursdagshilsen-generator for å skape unike og personlige hilsener. Perfekt for venner, familie og kollegaer.',
  keywords: ['bursdagshilsen', 'AI', 'generator', 'gratulasjon', 'bursdag', 'personlig hilsen'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Bursdagshilsen-generator | Innhold.AI',
    description: 'Skap unike og personlige bursdagshilsener med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/happy-birthday-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Bursdagshilsen-generator | Innhold.AI',
    description: 'Skap unike og personlige bursdagshilsener med vår AI-drevne generator.',
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

export default function HappyBirthdayGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Forfatterbiografi-generator',
  description: 'Bruk vår AI-drevne forfatterbiografi-generator for å skape unike og engasjerende forfatterbiografier. Fremhev dine prestasjoner og skrivestil effektivt.',
  keywords: ['forfatterbiografi', 'AI', 'biografi-generator', 'forfatter-presentasjon', 'skriveprofilering', 'personlig merkevarebygging'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Forfatterbiografi-generator | Innhold.AI',
    description: 'Skap unike og engasjerende forfatterbiografier med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/author-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Forfatterbiografi-generator | Innhold.AI',
    description: 'Skap unike og engasjerende forfatterbiografier med vår AI-drevne generator.',
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

export default function AuthorBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
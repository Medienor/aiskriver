import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI E-post emnelinjegenerator',
  description: 'Bruk vår AI-drevne e-post emnelinjegenerator for å skape engasjerende og effektive emnelinjer. Perfekt for markedsførere, bedriftseiere og alle som ønsker å forbedre e-postresponsen.',
  keywords: ['e-post emnelinjer', 'AI', 'emnelinjegenerator', 'markedsføring', 'e-post', 'konverteringsoptimalisering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI E-post emnelinjegenerator | Innhold.AI',
    description: 'Skap engasjerende og effektive e-post emnelinjer med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/email-subject-line-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI E-post emnelinjegenerator | Innhold.AI',
    description: 'Skap engasjerende og effektive e-post emnelinjer med vår AI-drevne generator.',
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

export default function EmailSubjectLineGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
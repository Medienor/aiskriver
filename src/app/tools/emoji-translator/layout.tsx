import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Emoji-oversetter',
  description: 'Bruk vår AI-drevne emoji-oversetter for å konvertere tekst til emojier og omvendt. Perfekt for sosiale medier, meldinger og kreativ kommunikasjon.',
  keywords: ['emoji', 'oversetter', 'AI', 'tekst til emoji', 'emoji til tekst', 'sosiale medier', 'kommunikasjon'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Emoji-oversetter | Innhold.AI',
    description: 'Konverter tekst til emojier og omvendt med vår AI-drevne emoji-oversetter.',
    url: 'https://innhold.ai/tools/emoji-translator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Emoji-oversetter | Innhold.AI',
    description: 'Konverter tekst til emojier og omvendt med vår AI-drevne emoji-oversetter.',
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

export default function EmojiTranslatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
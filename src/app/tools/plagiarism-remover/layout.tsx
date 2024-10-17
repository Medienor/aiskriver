import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Plagiat-fjerner',
  description: 'Bruk vår AI-drevne plagiat-fjerner for å omformulere tekst og skape unikt innhold. Bevar meningen mens du eliminerer plagiering.',
  keywords: ['plagiat-fjerner', 'AI', 'omskrivning', 'unikt innhold', 'plagiering', 'tekstforbedring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Plagiat-fjerner | Innhold.AI',
    description: 'Omformuler tekst og skap unikt innhold med vår AI-drevne plagiat-fjerner.',
    url: 'https://innhold.ai/tools/plagiarism-remover',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Plagiat-fjerner | Innhold.AI',
    description: 'Omformuler tekst og skap unikt innhold med vår AI-drevne plagiat-fjerner.',
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

export default function PlagiarismRemoverLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
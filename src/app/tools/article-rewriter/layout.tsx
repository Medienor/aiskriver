import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Artikkel-omskriver',
  description: 'Bruk vår AI-drevne artikkel-omskriver for å omformulere tekst og skape unikt innhold. Bevar meningen mens du forbedrer artikkelens kvalitet.',
  keywords: ['artikkel-omskriver', 'AI', 'omskrivning', 'unikt innhold', 'tekstforbedring', 'innholdsoptimalisering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Artikkel-omskriver | Innhold.AI',
    description: 'Omformuler og forbedre artikler med vår AI-drevne artikkel-omskriver.',
    url: 'https://innhold.ai/tools/article-rewriter',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Artikkel-omskriver | Innhold.AI',
    description: 'Omformuler og forbedre artikler med vår AI-drevne artikkel-omskriver.',
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

export default function ArticleRewriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
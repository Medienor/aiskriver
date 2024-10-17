import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Nisjeidé-generator',
  description: 'Bruk vår AI-drevne nisjeidé-generator for å oppdage unike og lønnsomme forretningsideer. Perfekt for entreprenører, oppstartsbedrifter og forretningsutviklere.',
  keywords: ['nisjeideer', 'AI', 'generator', 'forretningsutvikling', 'entreprenørskap', 'markedsanalyse'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Nisjeidé-generator | Innhold.AI',
    description: 'Oppdag unike og lønnsomme forretningsideer med vår AI-drevne nisjeidé-generator.',
    url: 'https://innhold.ai/tools/niche-ideas-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Nisjeidé-generator | Innhold.AI',
    description: 'Oppdag unike og lønnsomme forretningsideer med vår AI-drevne nisjeidé-generator.',
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

export default function NicheIdeasGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
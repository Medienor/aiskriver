import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Prompt-generator',
  description: 'Bruk vår AI-drevne prompt-generator for å skape effektive og kreative prompts. Optimaliser dine AI-interaksjoner med skreddersydde instruksjoner.',
  keywords: ['prompt-generator', 'AI', 'kunstig intelligens', 'kreativ skriving', 'AI-instruksjoner', 'innholdsgenerering'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Prompt-generator | Innhold.AI',
    description: 'Skap effektive og kreative prompts med vår AI-drevne prompt-generator.',
    url: 'https://innhold.ai/tools/ai-prompt-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Prompt-generator | Innhold.AI',
    description: 'Skap effektive og kreative prompts med vår AI-drevne prompt-generator.',
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

export default function AIPromptGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Innhold.AI vs Notion AI: Hvilken er best for innholdsproduksjon?',
  description: 'Sammenlign Innhold.AI og Notion AI for å finne den beste AI-skriveverktøyet for dine behov. Se hvorfor Innhold.AI er det overlegne valget for innholdsskapere.',
  keywords: ['Innhold.AI', 'Notion AI', 'AI-skriveverktøy', 'innholdsproduksjon', 'sammenligning'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'Innhold.AI vs Notion AI | Sammenligning av AI-skriveverktøy',
    description: 'Oppdage hvorfor Innhold.AI er det beste alternativet til Notion AI for innholdsproduksjon.',
    url: 'https://innhold.ai/comparison/innholdai-vs-notion-ai',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Innhold.AI vs Notion AI | Sammenligning',
    description: 'Finn ut hvorfor Innhold.AI er det overlegne valget for innholdsskapere sammenlignet med Notion AI.',
  },
}

export default function InnholdAIvsNotionAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
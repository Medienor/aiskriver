import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Startup-idégenerator',
  description: 'Bruk vår AI-drevne startup-idégenerator for å få inspirasjon til nye forretningsideer. Perfekt for gründere, innovatører og entreprenører som ønsker å utforske nye muligheter i markedet.',
  keywords: ['startup-ideer', 'AI', 'idégenerator', 'forretningsutvikling', 'innovasjon', 'entreprenørskap'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Startup-idégenerator | Innhold.AI',
    description: 'Få inspirasjon til innovative forretningsideer med vår AI-drevne startup-idégenerator.',
    url: 'https://innhold.ai/tools/startup-ideas-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Startup-idégenerator | Innhold.AI',
    description: 'Få inspirasjon til innovative forretningsideer med vår AI-drevne startup-idégenerator.',
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

export default function StartupIdeasGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
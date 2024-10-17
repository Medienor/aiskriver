import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Facebook Bio Generator',
  description: 'Bruk vår AI-drevne Facebook bio-generator for å skape unike og engasjerende biografier. Perfekt for personlige profiler, bedriftssider og influencere.',
  keywords: ['Facebook bio', 'AI', 'biogenerator', 'sosiale medier', 'personlig branding', 'bedriftsprofil'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Facebook Bio Generator | Innhold.AI',
    description: 'Skap unike og engasjerende Facebook-biografier med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/facebook-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Facebook Bio Generator | Innhold.AI',
    description: 'Skap unike og engasjerende Facebook-biografier med vår AI-drevne generator.',
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

export default function FacebookBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
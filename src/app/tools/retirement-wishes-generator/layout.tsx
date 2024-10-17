import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Pensjoneringsønsker Generator',
  description: 'Bruk vår AI-drevne generator for å skape personlige og rørende pensjoneringsønsker. Perfekt for kolleger, venner og familie som ønsker å uttrykke sin takknemlighet og gode ønsker for pensjonister.',
  keywords: ['pensjonering', 'ønsker', 'AI', 'generator', 'gratulasjonskort', 'avskjedshilsen'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Pensjoneringsønsker Generator | Innhold.AI',
    description: 'Skap personlige og rørende pensjoneringsønsker med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/retirement-wishes-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Pensjoneringsønsker Generator | Innhold.AI',
    description: 'Skap personlige og rørende pensjoneringsønsker med vår AI-drevne generator.',
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

export default function RetirementWishesGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
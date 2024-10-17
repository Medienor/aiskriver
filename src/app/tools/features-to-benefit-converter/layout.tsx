import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Features to Benefits Converter | Innhold.AI',
  description: 'Convert product features into compelling customer benefits with our AI-powered tool. Ideal for marketers, copywriters, and product managers.',
  keywords: ['features to benefits', 'AI', 'converter', 'marketing', 'copywriting', 'product management'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'Features to Benefits Converter | Innhold.AI',
    description: 'Transform product features into powerful customer benefits with our AI tool.',
    url: 'https://innhold.ai/tools/features-to-benefit-converter',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Features to Benefits Converter | Innhold.AI',
    description: 'Transform product features into powerful customer benefits with our AI tool.',
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

export default function FeaturesAndBenefitsConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Etsy Product Description Generator',
  description: 'Use our AI-powered Etsy product description generator to create compelling and SEO-friendly descriptions for your Etsy listings. Perfect for Etsy sellers looking to boost their sales.',
  keywords: ['Etsy', 'product description', 'AI', 'generator', 'SEO', 'e-commerce', 'online selling'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Etsy Product Description Generator | Innhold.AI',
    description: 'Create compelling Etsy product descriptions with our AI-powered generator.',
    url: 'https://innhold.ai/tools/etsy-product-description-generator',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Etsy Product Description Generator | Innhold.AI',
    description: 'Create compelling Etsy product descriptions with our AI-powered generator.',
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

export default function EtsyProductDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
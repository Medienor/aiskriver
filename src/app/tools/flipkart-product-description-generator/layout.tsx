import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Flipkart Product Description Generator',
  description: 'Generate compelling product descriptions for Flipkart listings using our AI-powered tool. Perfect for sellers, marketers, and e-commerce professionals.',
  keywords: ['Flipkart', 'product description', 'AI', 'e-commerce', 'content generator', 'online selling'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Flipkart Product Description Generator | Innhold.AI',
    description: 'Create engaging Flipkart product descriptions with our AI-powered generator.',
    url: 'https://innhold.ai/tools/flipkart-product-description-generator',
    siteName: 'Innhold.AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Flipkart Product Description Generator | Innhold.AI',
    description: 'Create engaging Flipkart product descriptions with our AI-powered generator.',
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

export default function FlipkartProductDescriptionGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
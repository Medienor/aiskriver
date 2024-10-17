import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Anmeldelser og Testimonials Generator',
  description: 'Bruk vår AI-drevne generator for å skape overbevisende anmeldelser og testimonials. Ideell for bedrifter som ønsker å forbedre sin online tilstedeværelse og kundetillit.',
  keywords: ['anmeldelser', 'testimonials', 'AI', 'generator', 'kundetillit', 'markedsføring'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Anmeldelser og Testimonials Generator | Innhold.AI',
    description: 'Skap overbevisende anmeldelser og testimonials med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/testimonials-reviews-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Anmeldelser og Testimonials Generator | Innhold.AI',
    description: 'Skap overbevisende anmeldelser og testimonials med vår AI-drevne generator.',
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

export default function TestimonialsReviewsGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
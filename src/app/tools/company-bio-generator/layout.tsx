import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Bedrifsbeskrivelse-generator',
  description: 'Bruk vår AI-drevne bedriftsbeskrivelse-generator for å skape unike og engasjerende bedriftsprofiler. Fremhev din virksomhets styrker og verdier effektivt.',
  keywords: ['bedriftsbiografi', 'AI', 'biografi-generator', 'bedriftspresentasjon', 'merkevarebygging', 'virksomhetsprofil'],
  authors: [{ name: 'Innhold.AI Team' }],
  openGraph: {
    title: 'AI Bedriftsbeskrivelse-generator | Innhold.AI',
    description: 'Skap unike og engasjerende bedriftsprofiler med vår AI-drevne generator.',
    url: 'https://innhold.ai/tools/company-bio-generator',
    siteName: 'Innhold.AI',
    locale: 'nb_NO',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'AI Bedriftsbeskrivelse-generator | Innhold.AI',
    description: 'Skap unike og engasjerende bedriftsprofiler med vår AI-drevne generator.',
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

export default function CompanyBioGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
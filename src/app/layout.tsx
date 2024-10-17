import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from "@/components/Providers"
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { Metadata } from 'next'
import ConditionalLayout from '@/components/ConditionalLayout'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Verktøy | Innhold.AI',
    template: '%s | Innhold.AI'
  },
  description: 'Utforsk våre kraftige AI-drevne verktøy for innholdsskapere.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </Providers>
        <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
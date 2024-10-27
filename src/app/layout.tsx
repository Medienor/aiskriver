import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from "@/components/Providers"
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { Metadata } from 'next'
import ConditionalLayout from '@/components/ConditionalLayout'
import Script from "next/script";


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Fremtidens skriveverktøy | Innhold.AI',
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
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "om9du0r61j");
            `,
          }}
        />
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/Navbar"
import { SideMenu } from "@/components/SideMenu"
import { SessionProvider } from "@/components/session-provider"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Innhold.AI",
  description: "AI-powered content generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={`${inter.className} antialiased bg-white dark:bg-gray-900`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen">
              <SideMenu />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-auto bg-white dark:bg-gray-900">
                  {children}
                </main>
              </div>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

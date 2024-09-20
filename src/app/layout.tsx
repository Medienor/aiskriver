import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { Navbar } from "@/components/Navbar"
import { SideMenu } from "@/components/SideMenu"
import { Providers } from "@/components/Providers"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Innhold.AI",
  description: "AI-powered content generation",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            <Navbar />
            <div className="flex flex-1 pt-16">
              <SideMenu />
              <main className="flex-1 w-full p-4 md:ml-64 bg-white dark:bg-gray-900">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

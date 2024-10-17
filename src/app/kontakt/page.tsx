import React from 'react';
import Link from 'next/link';
import Footer from '@/components/footer';

export default function Kontakt() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex-grow py-12">
          <div className="mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Kontakt Oss</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Har du spørsmål eller tilbakemeldinger? Ta gjerne kontakt med oss.
            </p>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kontaktinformasjon:</h2>
              <p className="text-gray-700 dark:text-gray-300">E-post: josef@medienor.no</p>
              <p className="text-gray-700 dark:text-gray-300">Postboks: Hesselbergsgate 9B, 0555 Oslo</p>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
}
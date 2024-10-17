'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Sparkles } from 'lucide-react';
import { Switch } from "@/components/ui/switch"

const plans = [
  { name: "Starter", monthly: 250, yearly: 2400 },
  { name: "Pro", monthly: 490, yearly: 4704 },
  { name: "Boost", monthly: 990, yearly: 9504 },
  { name: "Vekst", monthly: 1800, yearly: 17280 },
  { name: "Elite", monthly: 3490, yearly: 33504 },
  { name: "Super", monthly: 5000, yearly: 47904 }
];

export default function BliAffiliate() {
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Tjen passiv inntekt som Innhold AI affiliate</h1>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
            Elsker du å bruke Innhold AI? Tjen 30% livslang, tilbakevendende provisjon ved å henvise ditt publikum.
          </p>

          <Link href="/auth" passHref>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 mb-8"
            >
              <Sparkles className="w-6 h-6 mr-2 text-yellow-300" />
              Registrer deg som affiliate
              <Sparkles className="w-6 h-6 ml-2 text-yellow-300" />
            </Button>
          </Link>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Potensiell inntjening</h2>
              <div className="flex items-center space-x-4">
                <span className={`text-sm ${!isMonthly ? 'font-bold' : ''} text-gray-700 dark:text-gray-300`}>Årlig</span>
                <Switch
                  checked={isMonthly}
                  onCheckedChange={() => setIsMonthly(!isMonthly)}
                />
                <span className={`text-sm ${isMonthly ? 'font-bold' : ''} text-gray-700 dark:text-gray-300`}>Månedlig</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Plan</th>
                    <th scope="col" className="px-6 py-3">Pris</th>
                    <th scope="col" className="px-6 py-3">Din Provisjon (30%)</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.name} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {plan.name}
                      </th>
                      <td className="px-6 py-4">
                        {isMonthly 
                          ? `${plan.monthly.toLocaleString('no-NO')} kr/mnd` 
                          : `${plan.yearly.toLocaleString('no-NO')} kr/år`}
                      </td>
                      <td className="px-6 py-4">
                        {isMonthly
                          ? `${(plan.monthly * 0.3).toLocaleString('no-NO')} kr/mnd`
                          : `${(plan.yearly * 0.3).toLocaleString('no-NO')} kr (engangsbeløp)`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300">
              ✅ Vennligst klikk her for å registrere deg for Innhold AI affiliate-programmet. Du vil få en tilpasset lenke som du kan bruke for å henvise folk til Innhold AI.
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              🚀 Vi tilbyr 30% livslang tilbakevendende provisjon på alle salg. Vår minimumsutbetaling er 500 kr. Provisjoner blir betalbare etter 30 dager, og vi gjør utbetalinger i løpet av den første uken i måneden. Henvisnings-cookien varer i 60 dager.
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              🚨 Vær oppmerksom på at selv-henvisning er strengt forbudt og vil resultere i stenging av kontoen din. Du har ikke lov til å henvise deg selv eller ditt eget selskap. Hvis du skal registrere deg på vegne av dine klienter, vennligst kontakt oss først!
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              👮‍♂️ Å promotere din affiliate-lenke ved å kjøre betalt annonsering på noen plattform vil resultere i stenging av kontoen din. Dette gjelder for budgivning på alle nøkkelord.
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              💸 Eneste måten vi kan utbetale provisjon på er ved at du enten har et gyldig enkeltmannsforetak som er gratis å etablere, eller et aktiv selskap.
            </p>

            <p className="text-gray-700 dark:text-gray-300">
              📧 Hvis du har spørsmål om affiliate-programmet, vennligst kontakt oss ved å sende en e-post til josef@medienor.no.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <ul className="flex justify-center space-x-8 mb-6">
            <li>
              <Link href="/kontakt" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Kontakt
              </Link>
            </li>
            <li>
              <Link href="/brukervilkar" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Brukervilkår
              </Link>
            </li>
            <li>
              <Link href="/personvern" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Personvern
              </Link>
            </li>
            <li>
              <Link href="/bli-affiliate" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Affiliate
              </Link>
            </li>
          </ul>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Laget med <span className="text-red-500">❤</span> av Medienor AS
          </p>
        </div>
      </footer>
    </div>
  );
}
import React from 'react'
import { FileText, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function Component() {
  return (
    <div className="w-full bg-white dark:bg-gray-900 py-24 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-center items-center px-8">
        <div className="w-full max-w-7xl bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <div className="flex flex-col md:flex-row md:space-x-12">
            {/* Left column */}
            <div className="w-full md:w-1/2 p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Innebygd plagiatkontroll</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Vår avanserte plagiatkontroll skanner dokumentet ditt mot en omfattende database av kilder. Den analyserer setningsstruktur og ordvalg for å identifisere både direkte sitater og omskrevet innhold som kan trenge kildehenvisning.
              </p>
              <div className="flex flex-col items-start space-y-4">
                <Button 
                  className="px-8 py-6 text-xl font-semibold w-full sm:w-auto"
                  style={{
                    borderWidth: '2px',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderStyle: 'solid',
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(241deg, #0066ff 0%, #0052cc 100%)',
                    opacity: 1,
                    boxShadow: '0px 0px 16px 4px rgba(0, 102, 255, 0.15)',
                  }}
                >
                  <Link href="/write">Skriv innhold</Link>
                </Button>
                <Link href="/plagiat-sjekker" className="text-sm text-gray-400 dark:text-gray-500 hover:underline flex items-center">
                  Prøv plagiatsjekk <ArrowRight className="ml-1 w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right column */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-0 pt-8 pr-8">
                <div className="relative" style={{ height: '400px' }}>
                  <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-t-lg" style={{ height: '400px' }}>
                    {/* Document header */}
                    <div className="bg-gray-50 dark:bg-gray-600 p-4 border-b border-gray-200 dark:border-gray-500 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-300" />
                      <span className="font-semibold text-gray-700 dark:text-gray-200">Essay_om_Pluto.docx</span>
                    </div>
                    
                    {/* Document content */}
                    <div className="p-6 text-sm" style={{ height: 'calc(100% - 57px)', position: 'relative', overflow: 'hidden' }}>
                      <div className="space-y-4 text-gray-700 dark:text-gray-300">
                        <p>
                          Pluto, en gang kjent som den niende planeten i vårt solsystem, har en fascinerende historie som har endret vår forståelse av verdensrommet. <span className="bg-yellow-200 dark:bg-yellow-700">Oppdaget i 1930 av Clyde Tombaugh</span>, ble Pluto lenge betraktet som en fullverdig planet.
                        </p>
                        <p>
                          Men i 2006 tok Den internasjonale astronomiske union (IAU) en kontroversiell beslutning om å omklassifisere Pluto. <span className="bg-yellow-200 dark:bg-yellow-700">Den ble nå definert som en dvergplanet</span>, noe som førte til heftige debatter i det vitenskapelige miljøet og blant allmennheten.
                        </p>
                        <p>
                          Plutos unike egenskaper gjør den til et fascinerende studieobjekt. Med en diameter på bare 2377 km, er den mindre enn vår egen måne. Dens overflate består hovedsakelig av nitrogen-is, metan og karbonmonoksid, noe som gir den et blekrosa utseende.
                        </p>
                        <p>
                          <span className="bg-yellow-200 dark:bg-yellow-700">I 2015 fløy NASAs New Horizons-sonde forbi Pluto og ga oss de første detaljerte bildene av denne fjerne verden</span>. Disse bildene avslørte overraskende komplekse overflatestrukturer, inkludert fjell, daler og mulige underjordiske hav.
                        </p>
                        <p>
                          Til tross for sin nedgradering, fortsetter Pluto å fascinere både forskere og allmennheten. Dens historie minner oss om at vår forståelse av universet stadig er i endring, og at selv de mest grunnleggende kategoriene i astronomien kan utfordres av ny kunnskap.
                        </p>
                      </div>
                      {/* Stronger fade-out effect */}
                      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-white via-white to-transparent dark:from-gray-700 dark:via-gray-700"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
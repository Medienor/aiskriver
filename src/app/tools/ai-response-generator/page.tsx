"use client"

import { AIWriterPanel } from '../../../components/AIWriterPanel'
import { Check, X, Star, ChevronDown, ChevronUp } from 'lucide-react'
import Image from "next/image"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect, useRef } from "react"
import { motion, useAnimation } from "framer-motion"
import { Button } from "@/components/ui/button"
import SlidingBlocks from "@/components/sliding-blocks"

export default function AIWriterPage() {
  const customFields = {
    productInfo: {
      type: 'textarea' as const,
      label: 'Produktinformasjon',
      placeholder: 'Beskriv produktet du ønsker å lage en beskrivelse for'
    },
    targetAudience: {
      type: 'input' as const,
      label: 'Målgruppe',
      placeholder: 'Hvem er produktet rettet mot?'
    }
  };

  const hideFields = ['talkingPoints', 'keywords'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">
      <section>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">AI Svar Generator</h1>
        <p className="text-sm mb-6 md:mb-12 text-gray-500 dark:text-gray-400 mx-auto text-center max-w-2xl">
          Vår AI Svar Generator er et kraftfullt verktøy som hjelper deg å lage unike og engasjerende svar raskt og effektivt. Med avansert kunstig intelligens kan du enkelt skape svar som tiltrekker seg kunder og øker engasjementet.
        </p>
        <AIWriterPanel 
          hiddenPrompt="Din oppgave er å generere en overbevisende og engasjerende produktbeskrivelse for Amazon basert på den gitte produktinformasjonen. *Beskrivelsen skal være unik, SEO-vennlig, og tilpasset målgruppen. Inkluder viktige produktegenskaper, fordeler, og overbevisende salgspunkter. Bruk et språk som er klart, konsist, og optimalisert for konvertering. Sørg for at beskrivelsen er i tråd med Amazons retningslinjer for produktbeskrivelser.*" 
          customFields={customFields}
          hideFields={hideFields} />
      </section>
      
      <section className="flex flex-col lg:flex-row gap-8 py-8">
        <div className="lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Hva er en AI Svar Generator?</h2>
          <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
            En AI Svar Generator er et avansert verktøy som bruker kunstig intelligens for å lage unike og engasjerende svar. Dette verktøyet kan hjelpe deg med å forbedre svarene dine, øke synligheten og tiltrekke flere kunder.
          </p>
        </div>
        
        <div className="lg:w-1/2">
          <div className="bg-[#f3f4f6] dark:bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 text-center">Slik fungerer det:</h3>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">1</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Lim inn spørsmål</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">2</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Velg svarstil</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">3</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Få generert svar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">Innhold.AI eller ChatGPT BE?</h2>
        <p className="text-base mb-6 text-gray-700 dark:text-gray-300 text-center">
          Her er noen grunner til hvorfor Innhold.AI er et bedre valg enn tradisjonelle manuelle omskrivingstjenester
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">Funksjon</th>
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">Innhold.AI</th>
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">Manuell omskriving</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">Rask levering</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI kan omskrive artikler på sekunder, mens manuell omskriving kan ta timer eller dager.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="p-4 text-center text-green-500"><Check size={20} /></td>
                <td className="p-4 text-center text-red-500"><X size={20} /></td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">Konsistent kvalitet</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI leverer konsistent kvalitet på tvers av alle omskrivinger, uavhengig av volum.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="p-4 text-center text-green-500"><Check size={20} /></td>
                <td className="p-4 text-center text-red-500"><X size={20} /></td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">Kostnadseffektivt</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI tilbyr en mer kostnadseffektiv løsning sammenlignet med å ansette profesjonelle skribenter.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="p-4 text-center text-green-500"><Check size={20} /></td>
                <td className="p-4 text-center text-red-500"><X size={20} /></td>
              </tr>
              <tr>
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">Flerspråklig støtte</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI kan omskrive artikler på flere språk uten ekstra kostnad eller forsinkelse.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="p-4 text-center text-green-500"><Check size={20} /></td>
                <td className="p-4 text-center text-red-500"><X size={20} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="relative">
            <div
              style={{
                background: "linear-gradient(to bottom right, #a0c4ff, #c4e0ff)",
                width: "100%",
                height: "400px",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)"
              }}
            />
            <div className="absolute -bottom-4 -left-4 md:-left-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">4,8 / 5 (33 stemmer)</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100">
              AI Amazon Produktbeskrivelse Generator som øker salget
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Innhold.AI er ikke en hvilken som helst AI-generator. Det er en avansert løsning designet for å lage produktbeskrivelser som tiltrekker seg kunder og øker salget. Med Innhold.AI kan du:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Lage produktbeskrivelser i ulike stiler og toner som tiltrekker seg kunder.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Forbedre lesbarheten og engasjementet i dine produktbeskrivelser.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Spare tid og ressurser ved å automatisere beskrivelsesprosessen.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <PlagiarismFreeSection />
      <FAQSection />
      <SlidingBlocks />
    </div>
  )
}

function PlagiarismFreeSection() {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)
  const controls = useAnimation()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          controls.start({ width: "100%" })
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [controls])

  return (
    <section ref={ref} className="bg-gray-50 dark:bg-gray-800 py-12 px-4 sm:px-6 lg:px-8 rounded-lg">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              <span className="text-blue-600 dark:text-blue-400">Unike</span> produktbeskrivelser med AI
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Lag produktbeskrivelser med et verktøy som forstår kontekst og skaper originalt, unikt innhold! Innhold.AI er en AI-generator du kan stole på for å produsere beskrivelser av høy kvalitet som enkelt tiltrekker seg kunder.
            </p>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unike beskrivelser</span>
                <motion.span 
                  className="text-sm font-bold text-blue-600 dark:text-blue-400"
                  initial={{ opacity: 0 }}
                  animate={isVisible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  100%
                </motion.span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                <motion.div
                  className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full"
                  initial={{ width: "80%" }}
                  animate={controls}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>
            <Button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 w-full bg-[#06f] hover:bg-blue-700 text-white mb-4">
              Kom i gang nå
            </Button>
          </div>
          <div className="relative">
            <div
              style={{
                background: "linear-gradient(to bottom right, #a0c4ff, #c4e0ff)",
                width: "100%",
                height: "400px",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)"
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

const faqs = [
  {
    question: "Hvordan fungerer AI Amazon Produktbeskrivelse Generatoren?",
    answer: "Vår AI Amazon Produktbeskrivelse Generator bruker avansert maskinlæring for å analysere produktinformasjonen, forstå dens mening og struktur, og deretter generere unike og engasjerende beskrivelser. Den skaper innhold som tiltrekker seg kunder og øker salget."
  },
  {
    question: "Er de genererte beskrivelsene unike?",
    answer: "Ja, Innhold.AI er designet for å produsere unike, plagiatfrie produktbeskrivelser. Den genererer teksten grundig, slik at det resulterende innholdet er originalt og kan tiltrekke seg kunder."
  },
  {
    question: "Kan AI Amazon Produktbeskrivelse Generatoren håndtere forskjellige skrivestiler?",
    answer: "Absolutt. Vår AI Amazon Produktbeskrivelse Generator kan tilpasse seg ulike skrivestiler og toner. Du kan velge mellom flere forhåndsdefinerte stiler eller spesifisere dine egne preferanser for å få det ønskede resultatet."
  },
  {
    question: "Hvor mange ganger kan jeg generere beskrivelse for samme produkt?",
    answer: "Du kan generere en beskrivelse for et produkt så mange ganger du ønsker. Hver generering vil produsere en unik versjon av teksten, noe som gir deg muligheten til å eksperimentere med forskjellige formuleringer og stiler."
  },
  {
    question: "Kan AI Amazon Produktbeskrivelse Generatoren hjelpe med SEO-optimalisering?",
    answer: "Ja, vår AI-artikkelomskriver kan bidra til SEO-optimalisering. Den kan beholde viktige nøkkelord og fraser fra den originale teksten, samtidig som den forbedrer lesbarheten og engasjementet, noe som kan ha en positiv innvirkning på SEO-rangeringen."
  },
  {
    question: "Støtter AI-artikkelomskriveren flere språk?",
    answer: "Ja, vår AI-artikkelomskriver støtter omskriving på flere språk, inkludert norsk. Du kan omskrive innhold på det språket du foretrekker, og få høykvalitets resultater uavhengig av kildespråket."
  }
]

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">Vanlige spørsmål</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
              <button
                className="w-full text-left p-4 focus:outline-none flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-semibold text-gray-900 dark:text-gray-100">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-[#06f]" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-[#06f]" />
                )}
              </button>
              <div
                id={`faq-answer-${index}`}
                className={`px-4 pb-4 ${openIndex === index ? 'block' : 'hidden'}`}
              >
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
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
    productName: {
      type: 'input' as const,
      label: 'Produktnavn',
      placeholder: 'Skriv inn navnet på produktet'
    },
    productCategory: {
      type: 'input' as const,
      label: 'Produktkategori',
      placeholder: 'F.eks. elektronikk, klær, møbler, etc.'
    }
  };

  const hideFields = ['talkingPoints', 'keywords', 'audience'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">
      <section>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">AI Produktbeskrivelse Generator</h1>
        <p className="text-sm mb-6 md:mb-10 text-gray-500 dark:text-gray-400 w-full md:w-2/3 mx-auto text-center">
          Vår AI Produktbeskrivelse Generator er et kraftfullt verktøy for å skape unike og engasjerende produktbeskrivelser. Med bare noen få klikk kan du generere en rekke passende beskrivelser for dine produkter, og spare verdifull tid i prosessen.
        </p>
        <AIWriterPanel 
          hiddenPrompt="Din oppgave er å generere unike og engasjerende produktbeskrivelser basert på den gitte informasjonen. *Beskrivelsene skal være på norsk, tilpasset produktkategorien, og inneholde overbevisende salgspunkter. Vær kreativ, bruk variert språk, og fokuser på produktets fordeler og egenskaper. Unngå klisjeer og generiske formuleringer.*" 
          customFields={customFields}
          hideFields={hideFields} />
      </section>
      
      <section className="flex flex-col lg:flex-row gap-8 py-8">
        <div className="lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Hva er en AI Produktbeskrivelse Generator?</h2>
          <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
            En AI Produktbeskrivelse Generator er et avansert verktøy som bruker kunstig intelligens for å produsere unike og engasjerende produktbeskrivelser basert på gitte kriterier. Dette verktøyet kan hjelpe deg med å skape passende beskrivelser raskt og effektivt, enten det er for nettbutikker, markedsføringsmateriell, eller produktkataloger.
          </p>
        </div>
        
        <div className="lg:w-1/2">
          <div className="bg-[#f3f4f6] dark:bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 text-center">Slik fungerer det:</h3>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">1</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Angi produktdetaljer</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">2</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Trykk &quot;Generer&quot;</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">3</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Velg din favorittbeskrivelse</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">Innhold.AI eller ChatGPT?</h2>
        <p className="text-base mb-6 text-gray-700 dark:text-gray-300 text-center">
          Her har du par grunner til hvorfor Innhold.AI er et bedre valg enn ChatGPT
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">Funksjon</th>
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">Innhold.AI</th>
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">ChatGPT</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">Skreddersydd for innholdsproduksjon</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI er spesielt designet for å lage innhold for nettsider, blogger og sosiale medier.</p>
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
                      <TooltipTrigger className="text-left">Norsk språkstøtte</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI har full støtte for norsk språk, inkludert dialekter og nynorsk.</p>
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
                      <TooltipTrigger className="text-left">Integrert SEO-optimalisering</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI inkluderer verktøy for å optimalisere innholdet for søkemotorer.</p>
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
                      <TooltipTrigger className="text-left">Bransjespesifikke maler</TooltipTrigger>
                      <TooltipContent>
                        <p>Innhold.AI tilbyr maler tilpasset ulike bransjer og innholdstyper.</p>
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
              AI Produktbeskrivelse Generator som skaper unike beskrivelser
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Vår AI Produktbeskrivelse Generator er ikke en hvilken som helst generator. Det er et avansert verktøy designet for å levere kontekstuelt relevante og unike beskrivelser som stemmer overens med dine spesifikke behov. Med vår AI Produktbeskrivelse Generator kan du:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Generere høykvalitets, unike produktbeskrivelser i en rekke stiler og kategorier.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Lag store mengder beskrivelser i løpet av sekunder.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Spar tid og ressurser i beskrivelsesprosessen uten å gå på akkord med kreativiteten.</span>
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
              <span className="text-blue-600 dark:text-blue-400">Unik</span> AI Produktbeskrivelse Generator
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Generer unike produktbeskrivelser med et verktøy som forstår kontekst og skaper originale, kreative forslag! Vår AI Produktbeskrivelse Generator er et verktøy du kan stole på for å produsere beskrivelser av høy kvalitet som skiller seg ut i mengden.
            </p>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unikhet</span>
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
    question: "Hvilke typer produktbeskrivelser kan AI Produktbeskrivelse Generatoren lage?",
    answer: "Vår AI Produktbeskrivelse Generator er allsidig og kan generere et bredt utvalg av produktbeskrivelser. Dette inkluderer beskrivelser for elektronikk, klær, skjønnhetsprodukter, møbler, og mange flere."
  },
  {
    question: "Hvordan håndterer AI Produktbeskrivelse Generatoren personvernet ditt?",
    answer: "Vår AI Produktbeskrivelse Generator er designet med tanke på personvern. Den deler ikke dine personlige data med ikke-relaterte parter uten ditt samtykke. Alle genererte beskrivelser eies utelukkende av deg."
  },
  {
    question: "Kan AI Produktbeskrivelse Generatoren din lage beskrivelser i forskjellige stiler?",
    answer: "Ja, vår AI Produktbeskrivelse Generator kan justere beskrivelsesstilen basert på dine preferanser. Du kan spesifisere om du ønsker formelle beskrivelser, uformelle beskrivelser, tekniske beskrivelser, eller andre stiler for å få beskrivelser som passer perfekt til ditt behov."
  },
  {
    question: "Trenger jeg noen spesielle ferdigheter for å bruke denne AI Produktbeskrivelse Generatoren?",
    answer: "Nei, du trenger ingen spesielle ferdigheter for å bruke vår AI Produktbeskrivelse Generator. Det brukervennlige grensesnittet gjør det enkelt for alle å generere kreative og unike produktbeskrivelser."
  },
  {
    question: "Kan AI Navne Generatoren din hjelpe med å sjekke navnets tilgjengelighet?",
    answer: "Vår AI Navne Generator fokuserer primært på å generere unike og kreative navn. Mens den ikke direkte sjekker domene- eller varemerketilgjengelighet, gir den deg et stort utvalg av alternativer som øker sjansene for å finne et tilgjengelig navn."
  },
  {
    question: "Kan jeg bruke AI Navne Generatoren på flere språk?",
    answer: "Ja, vår AI Navne Generator støtter navnegenerering på flere språk. Du kan spesifisere hvilket språk eller hvilken kultur du ønsker at navnene skal være inspirert av."
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
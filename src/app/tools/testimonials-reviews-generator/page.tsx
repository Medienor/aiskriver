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
    productOrService: {
      type: 'input' as const,
      label: 'Produkt eller tjeneste',
      placeholder: 'Beskriv produktet eller tjenesten du ønsker anmeldelser for'
    },
    keyFeatures: {
      type: 'textarea' as const,
      label: 'Nøkkelegenskaper',
      placeholder: 'List opp noen viktige egenskaper eller fordeler ved produktet/tjenesten'
    }
  };

  const hideFields = ['talkingPoints', 'keywords', 'audience'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">
      <section>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">AI Testimonials & Reviews Generator</h1>
        <p className="text-sm mb-6 md:mb-10 text-gray-500 dark:text-gray-400 w-full md:w-2/3 mx-auto text-center">
          Vår AI Testimonials & Reviews Generator skaper autentiske og overbevisende anmeldelser på sekunder. Dette verktøyet sparer deg for tid og innsats ved å generere personlige og passende anmeldelser basert på dine preferanser.
        </p>
        <AIWriterPanel 
          hiddenPrompt="Din oppgave er å generere en liste over autentiske og overbevisende anmeldelser basert på informasjonen gitt om produktet eller tjenesten. *Anmeldelsene skal være på norsk, variere i lengde og tone, og reflektere ulike aspekter ved produktet/tjenesten. Inkluder både positive og konstruktive tilbakemeldinger for å sikre troverdighet. Hver anmeldelse bør være unik og personlig, som om den kommer fra forskjellige kunder.*" 
          customFields={customFields}
          hideFields={hideFields} />
      </section>
      
      <section className="flex flex-col lg:flex-row gap-8 py-8">
        <div className="lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Hva er en AI Testimonials & Reviews Generator?</h2>
          <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
            En AI Testimonials & Reviews Generator er et avansert verktøy som bruker kunstig intelligens for å produsere autentiske og overbevisende anmeldelser basert på gitte preferanser. Dette verktøyet kan hjelpe deg med å skape personlige og passende anmeldelser raskt og effektivt, enten det er for produkter, tjenester, eller andre formål.
          </p>
        </div>
        
        <div className="lg:w-1/2">
          <div className="bg-[#f3f4f6] dark:bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 text-center">Slik fungerer det:</h3>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">1</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Angi preferanser</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">2</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Trykk &quot;Generer&quot;</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">3</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Velg din nye anmeldelse!</p>
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
              AI Testimonials & Reviews Generator som skaper troverdige tilbakemeldinger
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Vår AI Testimonials & Reviews Generator er ikke en hvilken som helst anmeldelsesgenerator. Det er en sofistikert AI-drevet løsning designet for å levere autentiske, relevante og overbevisende anmeldelser som stemmer overens med dine spesifikke preferanser. Med vår generator kan du:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Generere autentiske anmeldelser basert på dine erfaringer og tilbakemeldinger.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Få flere alternativer på sekunder, slik at du kan velge den perfekte anmeldelsen.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Spar tid og innsats ved å la AI-en gjøre det harde arbeidet for deg.</span>
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
              <span className="text-blue-600 dark:text-blue-400">Unik</span> AI Testimonials & Reviews Generator
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Generer unike anmeldelser med et verktøy som forstår dine preferanser og skaper originale, overbevisende tilbakemeldinger! Vår AI Testimonials & Reviews Generator er en løsning du kan stole på for å produsere anmeldelser av høy kvalitet som skiller seg ut i mengden.
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
              Lag din unike anmeldelse nå
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
    question: "Hvilke typer anmeldelser kan AI-generatoren lage?",
    answer: "Vår AI Testimonials & Reviews Generator er allsidig og kan generere et bredt utvalg av anmeldelser. Dette inkluderer anmeldelser basert på dine erfaringer, tilbakemeldinger, og mye mer. Den kan lage anmeldelser som er morsomme, seriøse, kreative eller profesjonelle, avhengig av dine preferanser."
  },
  {
    question: "Hvordan håndterer AI Testimonials & Reviews Generatoren personvernet ditt?",
    answer: "Vår generator er designet med tanke på personvern. Den lagrer ikke personlige data og deler ikke informasjon med tredjeparter. Alle genererte anmeldelser er kun til din personlige bruk."
  },
  {
    question: "Kan AI Testimonials & Reviews Generatoren lage anmeldelser på forskjellige språk?",
    answer: "Ja, vår AI Testimonials & Reviews Generator kan lage anmeldelser på flere språk, inkludert norsk. Du kan spesifisere hvilket språk du ønsker, og generatoren vil tilpasse seg deretter."
  },
  {
    question: "Trenger jeg noen spesielle ferdigheter for å bruke denne AI Testimonials & Reviews Generatoren?",
    answer: "Nei, du trenger ingen spesielle ferdigheter for å bruke vår generator. Det brukervennlige grensesnittet gjør det enkelt for alle å generere kreative og unike anmeldelser."
  },
  {
    question: "Kan AI Testimonials & Reviews Generatoren hjelpe meg med å finne ledige anmeldelser?",
    answer: "Vår generator fokuserer på å skape unike og kreative anmeldelser. Mens den ikke direkte sjekker tilgjengelighet på spesifikke plattformer, øker den sannsynligheten for at du finner en ledig anmeldelse ved å generere mange unike alternativer."
  },
  {
    question: "Hvor mange brukernavn kan jeg generere om gangen?",
    answer: "Du kan generere flere brukernavn om gangen. Vår generator er designet for å gi deg en rekke alternativer basert på dine preferanser, slik at du kan velge det som passer best for deg."
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
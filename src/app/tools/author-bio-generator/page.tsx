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
    authorName: {
      type: 'input' as const,
      label: 'Forfatterens navn',
      placeholder: 'Skriv inn forfatterens fulle navn'
    },
    genre: {
      type: 'input' as const,
      label: 'Sjanger',
      placeholder: 'F.eks. skjønnlitteratur, faglitteratur, poesi'
    }
  };

  const hideFields = ['talkingPoints', 'keywords'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">
      <section>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">AI Forfatter Bio</h1>
        <p className="text-sm mb-6 md:mb-12 text-gray-500 dark:text-gray-400 mx-auto text-center max-w-2xl">
          Vår AI Forfatter Bio-generator hjelper deg å skape profesjonelle og engasjerende forfatterbiografier på sekunder. Dette verktøyet sparer deg for tid og sikrer at din forfatterbio gjør et varig inntrykk på leserne dine.
        </p>
        <AIWriterPanel 
          hiddenPrompt="Din oppgave er å lage en profesjonell og engasjerende forfatterbiografi basert på de gitte detaljene. *Biografien skal være på norsk, fremheve forfatterens unike egenskaper, viktigste prestasjoner og skriverstil. Tilpass tonen til forfatterens sjanger og målgruppe. Inkluder relevant informasjon om forfatterens bakgrunn, utdanning og litterære innflytelser hvis tilgjengelig. Biografien bør være konsis, men fengslende, og gi leserne et klart bilde av forfatteren og deres arbeid.*" 
          customFields={customFields}
          hideFields={hideFields} />
      </section>
      
      <section className="flex flex-col lg:flex-row gap-8 py-8">
        <div className="lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Hva er en AI Forfatter Bio-generator?</h2>
          <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
            En AI Forfatter Bio-generator er et avansert verktøy som bruker kunstig intelligens for å produsere profesjonelle og engasjerende forfatterbiografier basert på gitte detaljer. Dette verktøyet kan hjelpe deg med å skape en overbevisende forfatterbio raskt og effektivt, som fremhever dine unike egenskaper og prestasjoner som forfatter.
          </p>
        </div>
        
        <div className="lg:w-1/2">
          <div className="bg-[#f3f4f6] dark:bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 text-center">Slik fungerer det:</h3>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">1</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Skriv inn forfatterdetaljer</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">2</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Trykk &quot;Generer&quot;</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">3</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Din forfatterbio er klar!</p>
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
              AI Forfatter Bio-generator som skriver som en profesjonell
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Vår AI Forfatter Bio-generator er ikke en hvilken som helst tekstgenerator. Det er en profesjonell biografi-skaper designet for å levere engasjerende og overbevisende forfatterbiografier som stemmer overens med dine spesifikke behov. Med vår AI Forfatter Bio-generator kan du:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Generere høykvalitets, feilfrie forfatterbiografier i ulike stiler og toner.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Skape en overbevisende forfatterbio i løpet av sekunder.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Spare tid og ressurser uten å gå på akkord med kvaliteten på din forfatterbio.</span>
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
              <span className="text-blue-600 dark:text-blue-400">Unik</span> AI Forfatter Bio-generator
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Generer unike forfatterbiografier med et verktøy som forstår din personlige kontekst og skaper originalt, engasjerende innhold! Vår AI Forfatter Bio-generator er et verktøy du kan stole på for å produsere overbevisende forfatterbiografier av høy kvalitet som skiller seg ut.
            </p>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unikt innhold</span>
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
    question: "Hvilke typer forfatterbiografier kan AI Forfatter Bio-generatoren lage?",
    answer: "Vår AI Forfatter Bio-generator er allsidig og kan generere et bredt utvalg av forfatterbiografier. Dette inkluderer korte biografier for bokomslag, lengre biografier for forfatternettsider, biografier for sosiale medier, og mer spesialiserte biografier for akademiske eller profesjonelle formål."
  },
  {
    question: "Hvordan håndterer AI Forfatter Bio-generatoren personvernet ditt?",
    answer: "Vår AI Forfatter Bio-generator er designet med tanke på personvern. Den deler ikke dine personlige data med ikke-relaterte parter uten ditt samtykke. All generert innhold eies utelukkende av deg."
  },
  {
    question: "Kan AI Forfatter Bio-generatoren skrive i forskjellige stiler og toner?",
    answer: "Ja, vår AI Forfatter Bio-generator kan justere skriverstilen og tonen basert på dine preferanser. Vi tilbyr flere stemmetoner du kan velge mellom, inkludert en tilpasset tone for å skape en svært personlig biografi som passer din unike forfatterstemme."
  },
  {
    question: "Trenger jeg noen spesielle ferdigheter for å bruke denne AI Forfatter Bio-generatoren?",
    answer: "Nei, du trenger ingen spesielle ferdigheter for å bruke vår AI Forfatter Bio-generator. Det brukervennlige grensesnittet gjør det enkelt for alle å generere overbevisende forfatterbiografier av høy kvalitet."
  },
  {
    question: "Kan AI Forfatter Bio-generatoren hjelpe med å fremheve mine viktigste prestasjoner?",
    answer: "Ja, vår AI Forfatter Bio-generator er designet for å fremheve dine viktigste prestasjoner og unike egenskaper som forfatter. Den kan inkludere informasjon om dine publiserte verk, priser, spesialiteter og personlige erfaringer for å skape en engasjerende og overbevisende biografi."
  },
  {
    question: "Kan jeg bruke AI Forfatter Bio-generatoren på flere språk?",
    answer: "Selvfølgelig. Vår AI Forfatter Bio-generator er ikke bare bygget for norsk biografigenerering. Vi inkluderer støtte for ytterligere 30+ språk, slik at du kan skape overbevisende forfatterbiografier for et internasjonalt publikum."
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
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
    originalText: {
      type: 'textarea' as const,
      label: 'Din personlige informasjon',
      placeholder: 'Beskriv deg selv, dine erfaringer og mål'
    },
    targetAudience: {
      type: 'input' as const,
      label: 'Målgruppe',
      placeholder: 'F.eks. arbeidsgivere, utdanningsinstitusjoner'
    }
  };

  const hideFields = ['talkingPoints', 'keywords', 'audience'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">
      <section>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">AI Personlig Kommentar Generator</h1>
        <p className="text-sm mb-6 md:mb-10 text-gray-500 dark:text-gray-400 w-full md:w-2/3 mx-auto text-center">
          Vår AI Personlig Kommentar Generator hjelper deg med å lage unike og personlige kommentarer basert på informasjonen du gir. Med dette verktøyet kan du enkelt skape engasjerende og meningsfulle kommentarer.
        </p>
        <AIWriterPanel 
          hiddenPrompt="Din oppgave er å generere en personlig og engasjerende kommentar basert på informasjonen gitt. *Kommentaren skal være på norsk og tilpasses målgruppen. Fokuser på å skape et unikt og autentisk innhold som fremhever personens styrker, erfaringer og mål. Sørg for at kommentaren er velformulert, profesjonell og tilpasset konteksten (f.eks. jobbsøknad, skolesøknad).*" 
          customFields={customFields}
          hideFields={hideFields} />
      </section>
      
      <section className="flex flex-col lg:flex-row gap-8 py-8">
        <div className="lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Hva er en AI Personlig Kommentar Generator?</h2>
          <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
            En AI Personlig Kommentar Generator er et avansert verktøy som bruker kunstig intelligens for å lage personlige og unike kommentarer. Dette verktøyet hjelper deg med å skape engasjerende innhold basert på den informasjonen du gir, samtidig som du bevarer den opprinnelige meningen og konteksten.
          </p>
        </div>
        
        <div className="lg:w-1/2">
          <div className="bg-[#f3f4f6] dark:bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 text-center">Slik fungerer det:</h3>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">1</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Lim inn informasjonen</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">2</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Klikk &quot;Generer kommentar&quot;</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">3</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Få personlig kommentar</p>
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
              AI Personlig Kommentar Generator som skaper engasjerende innhold
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Vår AI Personlig Kommentar Generator er ikke et vanlig verktøy. Det er en avansert løsning designet for å levere unike, personlige kommentarer som bevarer den opprinnelige meningen. Med vår AI Personlig Kommentar Generator kan du:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Lage personlige kommentarer som engasjerer leserne.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Skape unikt innhold basert på den informasjonen du gir raskt og effektivt.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Forbedre kvaliteten på dine kommentarer og unngå generiske svar.</span>
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
              <span className="text-blue-600 dark:text-blue-400">Personlige</span> AI-kommentarer
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Lag personlige kommentarer med et verktøy som forstår kontekst og skaper originalt, unikt innhold! Vår AI Personlig Kommentar Generator er en løsning du kan stole på for å produsere kommentarer av høy kvalitet som engasjerer leserne.
            </p>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Personlige kommentarer</span>
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
    question: "Hvordan fungerer AI Personlig Kommentar Generatoren?",
    answer: "Vår AI Personlig Kommentar Generator bruker avansert kunstig intelligens for å analysere og generere kommentarer. Den forstår konteksten og meningen i den informasjonen du gir, og skaper deretter en ny kommentar som er unik og engasjerende, samtidig som den bevarer den opprinnelige meningen."
  },
  {
    question: "Er kommentarene som genereres av AI Personlig Kommentar Generatoren helt unike?",
    answer: "Ja, kommentarene som genereres av vår AI Personlig Kommentar Generator er designet for å være helt unike. Verktøyet lager kommentarer på en måte som gjør dem originale og engasjerende, samtidig som de beholder den opprinnelige meningen og konteksten."
  },
  {
    question: "Kan AI Personlig Kommentar Generatoren håndtere forskjellige typer informasjon og emner?",
    answer: "Absolutt. Vår AI Personlig Kommentar Generator er allsidig og kan håndtere en rekke forskjellige informasjonstyper og emner, inkludert akademiske tekster, artikler, blogginnlegg, rapporter og mer. Den tilpasser seg konteksten og stilen i den informasjonen du gir."
  },
  {
    question: "Hvor nøyaktig er AI Personlig Kommentar Generatoren i å bevare den opprinnelige meningen?",
    answer: "Vår AI Personlig Kommentar Generator er designet for å bevare den opprinnelige meningen så nøyaktig som mulig. Den analyserer informasjonen grundig for å forstå konteksten og hovedpoengene, og genererer deretter kommentarer på en måte som beholder disse elementene mens den skaper unike kommentarer."
  },
  {
    question: "Kan AI Personlig Kommentar Generatoren brukes for akademisk skriving?",
    answer: "Ja, AI Plagiat-fjerneren kan være nyttig for akademisk skriving, spesielt for å omformulere kilder eller for å sikre at ditt eget arbeid er fritt for utilsiktet plagiering. Det er imidlertid viktig å merke seg at i akademisk sammenheng bør du alltid sitere dine kilder korrekt og bruke verktøyet som et hjelpemiddel, ikke som en erstatning for original tenkning og skriving."
  },
  {
    question: "Støtter AI Plagiat-fjerneren flere språk?",
    answer: "Ja, vår AI Plagiat-fjerner støtter flere språk, inkludert norsk. Den kan effektivt omskrive tekst på norsk, både bokmål og nynorsk, samt en rekke andre språk. Dette gjør den til et verdifullt verktøy for flerspråklige brukere og innholdsskapere."
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
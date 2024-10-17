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
    productDescription: {
      type: 'textarea' as const,
      label: 'Produktbeskrivelse',
      placeholder: 'Beskriv produktet eller tjenesten du vil lage en annonsetittel for'
    },
    targetAudience: {
      type: 'input' as const,
      label: 'Målgruppe',
      placeholder: 'Beskriv din målgruppe'
    }
  };

  const hideFields = ['talkingPoints', 'keywords'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-24">
      <section>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100 text-center">AI Annonsetittel Generator</h1>
        <p className="text-sm md:text-base mb-6 md:mb-12 text-gray-500 dark:text-gray-400 mx-auto text-center max-w-2xl">
          Vår AI Annonsetittel Generator er et kraftfullt verktøy som hjelper deg å skape engasjerende og effektive annonsetitler raskt og enkelt. Med avansert kunstig intelligens kan du generere kreative og relevante titler som fanger oppmerksomheten til ditt publikum.
        </p>
        <AIWriterPanel 
          hiddenPrompt="Du er en ekspert på digital markedsføring som jobber på Innhold.AI. Din oppgave er å generere kreative, engasjerende og effektive annonsetitler basert på den gitte produktbeskrivelsen og målgruppen. *Titlene skal være korte, fengende og optimalisert for digital annonsering. Inkluder minst 5 forskjellige titler, og gi en kort forklaring på hvorfor hver tittel kan være effektiv.*" 
          customFields={customFields}
          hideFields={hideFields} />
      </section>
      
      <section className="flex flex-col lg:flex-row gap-8 py-8">
        <div className="lg:w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Hva er en AI Annonsetittel Generator?</h2>
          <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
            En AI Annonsetittel Generator er et avansert verktøy som bruker kunstig intelligens for å hjelpe markedsførere med å skape engasjerende og effektive annonsetitler. Dette verktøyet kan assistere deg med å generere ideer, optimalisere titler og tilpasse dem til ulike målgrupper, noe som gjør hele prosessen mer effektiv og kreativ.
          </p>
        </div>
        
        <div className="lg:w-1/2">
          <div className="bg-[#f3f4f6] dark:bg-gray-800 p-8 rounded-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100 text-center">Slik fungerer det:</h3>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">1</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Beskriv din annonseidé</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center mb-6 md:mb-0">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">2</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">AI genererer titler</p>
              </div>
              <div className="hidden md:block text-[#06f] dark:text-blue-400 text-2xl">→</div>
              <div className="flex-1 text-center">
                <div className="bg-[#06f] text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">3</div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Rediger og perfeksjonér</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100 text-center">Innhold.AI eller ChatGPT BE?</h2>
        <p className="text-base mb-6 text-gray-700 dark:text-gray-300 text-center">
          Her er noen grunner til hvorfor Innhold.AI AI Annonsetittel Generator er et bedre valg enn ChatGPT BE
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">Funksjon</th>
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">Innhold.AI</th>
                <th className="p-4 text-left text-gray-900 dark:text-gray-100">ChatGPT BE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-600">
                <td className="p-4 text-gray-700 dark:text-gray-300">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="text-left">Rask idégenerering</TooltipTrigger>
                      <TooltipContent>
                        <p>AI kan generere mange ideer på kort tid, noe som kan hjelpe med skriveblokkering.</p>
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
                      <TooltipTrigger className="text-left">Automatisk strukturering</TooltipTrigger>
                      <TooltipContent>
                        <p>AI kan hjelpe med å organisere bokens struktur og kapitler effektivt.</p>
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
                      <TooltipTrigger className="text-left">Karakterutvikling</TooltipTrigger>
                      <TooltipContent>
                        <p>AI kan assistere med å skape dype og komplekse karakterer.</p>
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
                      <TooltipTrigger className="text-left">Sjangerspesifikke forslag</TooltipTrigger>
                      <TooltipContent>
                        <p>AI kan gi forslag basert på spesifikke sjangre og skrivestiler.</p>
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
              AI Annonsetittel Generator som tenker som en markedsfører
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Innhold.AI AI Annonsetittel Generator er ikke en vanlig tekstgenerator. Det er en sofistikert assistent designet for å hjelpe markedsførere med å skape engasjerende og unike annonsetitler. Med Innhold.AI kan du:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Generere kreative og relevante annonsetitler.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Optimalisere titler for ulike målgrupper og plattformer.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Øke din produktivitet og effektivitet som markedsfører.</span>
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
              <span className="text-blue-600 dark:text-blue-400">Originale</span> annonsetitler med AI Annonsetittel Generator
            </h2>
            <p className="text-base mb-6 text-gray-700 dark:text-gray-300">
              Skap unike og engasjerende annonsetitler med et verktøy som forstår markedsføring! Innhold.AI AI Annonsetittel Generator er en assistent du kan stole på for å produsere originale titler som inspirerer og engasjerer ditt publikum.
            </p>
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Originalitet</span>
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
              Start din annonse nå
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
    question: "Hvilke typer annonser kan AI Annonsetittel Generator hjelpe meg med?",
    answer: "Vår AI Annonsetittel Generator er allsidig og kan hjelpe deg med en rekke annonsetyper, inkludert sosiale medier, søkemotorannonser, displayannonser og mer. Den kan assistere med alt fra idégenerering og optimalisering til tilpasning for ulike plattformer."
  },
  {
    question: "Hvordan håndterer AI Annonsetittel Generator personvernet mitt?",
    answer: "Innhold.AI er designet med tanke på personvern. Vi deler ikke dine personlige data eller annonseideer med ikke-relaterte parter uten ditt samtykke. Alt generert innhold eies utelukkende av deg."
  },
  {
    question: "Kan AI Annonsetittel Generator tilpasse seg ulike markedsføringsstiler?",
    answer: "Ja, vår AI Annonsetittel Generator kan tilpasse seg forskjellige markedsføringsstiler og toner. Du kan spesifisere ønsket stil, og AI-en vil forsøke å matche den, enten det er formell, uformell, humoristisk, dramatisk eller noe annet."
  },
  {
    question: "Trenger jeg noen spesielle ferdigheter for å bruke denne AI Annonsetittel Generator?",
    answer: "Nei, du trenger ingen spesielle tekniske ferdigheter for å bruke Innhold.AI's bokskriver. Det brukervennlige grensesnittet gjør det enkelt for alle å generere ideer og innhold. Men en grunnleggende forståelse av skriving og historiefortelling vil være nyttig for å få mest mulig ut av verktøyet."
  },
  {
    question: "Kan AI-bokskriveren hjelpe med research for min bok?",
    answer: "Mens AI-bokskriveren primært fokuserer på å hjelpe med selve skriveprosessen, kan den gi forslag til researchtemaer og generere ideer basert på eksisterende kunnskap. For spesifikk og detaljert research anbefaler vi imidlertid å bruke pålitelige kilder og ekspertkonsultasjon."
  },
  {
    question: "Kan jeg bruke AI-bokskriveren på flere språk?",
    answer: "Ja, vår AI-bokskriver støtter flere språk, inkludert norsk. Du kan generere innhold på det språket du foretrekker, noe som gjør det mulig å nå et bredere publikum eller skrive på ditt morsmål."
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
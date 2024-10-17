'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"

interface PricingTierProps {
  title: string;
  price: number;
  features: string[];
  stripeLink: string;
  savingsLabel?: string;
}

const PricingTier: React.FC<PricingTierProps> = ({ 
  title, 
  price, 
  features, 
  stripeLink,
  savingsLabel
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
      <div className="mb-4 flex items-end">
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{price} kr</p>
        {savingsLabel && (
          <span className="ml-2 text-green-500 font-semibold">{savingsLabel}</span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">per måned</p>
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <a href={stripeLink} target="_blank" rel="noopener noreferrer" className="w-full">
        <Button className="w-full bg-[#06f] hover:bg-blue-700 text-white">
          Velg pakke
        </Button>
      </a>
      <p className="text-xs text-gray-400 mt-2 text-center">
        {title === "Månedlig" 
          ? "Du blir belastet en gang hver måned." 
          : "Du blir belastet for hele året med engang"}
      </p>
    </div>
  )
}

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <button
        className="flex justify-between items-center w-full py-4 px-6 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
        onClick={onClick}
      >
        <span className="font-medium">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 py-4 text-gray-600 dark:text-gray-400">{answer}</p>
      </div>
    </div>
  )
}

export default function Pricing() {
  const features = [
    "Ubegrenset AI-generering",
    "Ubegrenset AI-assistanse",
    "Ubegrenset Siteringer",
    "5 plagiat søk hver måned"
  ];

  const pricingTiers = [
    {
      title: "Månedlig",
      price: 299,
      features: features,
      stripeLink: "https://buy.stripe.com/5kA9D27Yi6i70tqbIW"
    },
    {
      title: "Årlig",
      price: 199,
      features: features,
      stripeLink: "https://buy.stripe.com/eVa9D23I2dKza4014j",
      savingsLabel: "Spar 33%"
    }
  ];

  const [openAccordion, setOpenAccordion] = useState<number | null>(null);

  const faqItems = [
    {
      question: "Kan jeg avbryte kjøpet?",
      answer: "Abonnementer på Innhold.AI er løpende, og du vil automatisk bli fakturert etter at du har abonnert på en av våre pakker. Du kan når som helst kansellere avtalen din ved å gå på Instillinger -> Betalinger. Her inne kan du avbryte ditt abonnement og pakken din vil gjelde ut inneværende måned. Du blir heller ikke fakturert eller trukket igjen."
    },
    {
      question: "Kan jeg oppgradere eller nedgradere?",
      answer: "Vi tilbyr en pakke som tilbyr ubegrenset generering av innhold på Innhold.AI. Dersom du nedgraderer kan du fortsatt bruke tjenesten, men du blir begrenset til 200 ord daglig og mister flere gode tillegstjenester."
    },
    {
      question: "Tilbyr dere gratis prøveperiode?",
      answer: "Innhold.AI kan brukes helt gratis med visse begrensninger, om du ikke oppgraderer blir man begrenset til 200 ord hver dag."
    },
    {
      question: "Hvilken betalingsmetoder godtar dere?",
      answer: "Vi aksepterer alle kredittkort, inkludert Visa, MasterCard og American Express. Vi støtter også Klarna og Apple Pay."
    },
    {
      question: "Hvem passer Innhold.AI for?",
      answer: "Innhold.AI er et super verktøy som forenkler tekstskrivingen. Vårt verktøy er ideelt for studenter, lærere, journalister, bloggere, innholdsskapere og SEO-eksperter. Hvis du bruker mye tid på å skrive og gjøre research, kan vi garantere at Innhold.AI vil effektivisere hverdagen din."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Enkel pris for alle</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Opplev en ny måte å skrive på med Innhold.AI</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingTier
              key={index}
              title={tier.title}
              price={tier.price}
              features={tier.features}
              stripeLink={tier.stripeLink}
              savingsLabel={tier.savingsLabel}
            />
          ))}
        </div>
        
        <div className="mt-16 space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openAccordion === index}
              onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
            />
          ))}
        </div>

        <div className="mt-16">
          <Footer />
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from 'react'

export default function HowToChooseAgent() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  const steps = [
    {
      title: "Last opp tekst",
      description: "Lim inn eller last opp teksten du vil sjekke for plagiat. Deretter trykker du på sjekk plagiat.",
    },
    {
      title: "Resultatet",
      description: "Ved hjelp av AI teknologi, vil vi gi deg et resultat på om teksten er plagiert eller ikke.",
    },
    {
      title: "Endre med AI",
      description: "Dersom teksten innholder plagiat, kan du endre den med vår AI teknologi til ditt ønske.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">Slik gjør du det</h2>
      <div className="flex flex-col md:flex-row justify-between gap-8">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center text-center flex-1 mb-8 md:mb-0"
            onMouseEnter={() => setHoveredStep(index)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            <div className="relative mb-4">
              <div 
                className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-[#06f] border-[5px] border-[#e6f0ff] flex items-center justify-center transition-all duration-300 ease-in-out ${
                  hoveredStep === index ? 'scale-110 shadow-lg' : ''
                }`}
              >
                <span className={`text-white font-bold text-lg md:text-xl transition-all duration-300 ${
                  hoveredStep === index ? 'scale-110' : ''
                }`}>
                  {index + 1}
                </span>
              </div>
            </div>
            <h3 className={`text-lg md:text-xl font-semibold mb-2 transition-all duration-300 ${
              hoveredStep === index ? 'text-[#06f] dark:text-[#3b82f6]' : 'text-gray-900 dark:text-white'
            }`}>
              {step.title}
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
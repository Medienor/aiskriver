"use client"

import { motion } from "framer-motion"
import { Search } from "lucide-react"

const words = ["Plagiat", "Sjekk", "Tekst", "Analyse", "Innhold", "Kopi", "Original"]

export default function ImprovedPlagiarismSection() {
  return (
    <section className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="w-full lg:w-1/2 mb-12 lg:mb-0 lg:pr-8 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Få flere plagiatsjekker inkludert i din profil
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 mx-auto lg:mx-0 max-w-md lg:max-w-none">
              Hos Innhold.AI vet vi hvor viktig det er å holde konsentrasjonen oppe. Derfor garanterer vi at vårt plagiatsjekk-verktøy
              er fritt for irriterende bannerannonser og video-popups. Med oss kan du jobbe effektivt og uforstyrret! Alle nye brukere får 10 gratis plagiatsjekker.
            </p>
            <button
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#06f] hover:bg-blue-700 dark:bg-blue-400 dark:text-gray-900 dark:hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06f] dark:focus:ring-blue-400 transition duration-150 ease-in-out"
              aria-label="Start plagiatsjekk"
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
            >
              Start plagiatsjekk
              <Search className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center items-center">
            <div className="relative w-64 h-80">
              <motion.div
                className="absolute inset-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                initial={{ rotate: -5 }}
                animate={{ rotate: 5 }}
                transition={{ repeat: Infinity, duration: 5, repeatType: "reverse" }}
              >
                <div className="h-4 bg-[#06f] dark:bg-blue-500" />
                <div className="p-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-2 bg-gray-200 dark:bg-gray-700 rounded my-2" />
                  ))}
                </div>
              </motion.div>
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ repeat: Infinity, duration: 2.5, repeatType: "reverse" }}
              >
                <Search className="w-16 h-16 text-[#06f] dark:text-blue-400" />
              </motion.div>
              {words.map((word, index) => (
                <motion.div
                  key={word}
                  className="absolute top-1/2 left-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none"
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: [0, (index % 2 === 0 ? 1 : -1) * Math.random() * 100],
                    y: [0, (index % 2 === 0 ? -1 : 1) * Math.random() * 100],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                >
                  {word}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
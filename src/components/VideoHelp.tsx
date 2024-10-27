import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

interface AccordionItemProps {
  title: string
  subtitle: string
  videoSrc: string
  isOpen: boolean
  toggleAccordion: () => void
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, subtitle, videoSrc, isOpen, toggleAccordion }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex justify-between items-center w-full py-4 px-6 text-left text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
        onClick={toggleAccordion}
      >
        <div>
          <span className="font-medium">{title}</span>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800">
              <div className="w-4/5 mx-auto">
                <video 
                  src={videoSrc} 
                  controls 
                  className="w-full rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const VideoHelp: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(null)

  const accordionData = [
    {
      title: 'Slik starter du',
      subtitle: 'Slik kan du starte et tomt dokument og bruke autocomplete',
      videoSrc: '/videohelp1.mp4',
    },
    {
      title: 'Last opp kilder til biblioteket',
      subtitle: 'Bygg ditt eget bibliotek av informasjon ved å hente kilder på nett eller laste opp PDF-filer',
      videoSrc: '/videohelp2.mp4',
    },
    {
      title: 'Slik kan du henvise til kilder',
      subtitle: 'Du kan enkelt finne relevante kilder du kan henvise til i din tekst',
      videoSrc: '/videohelp3.mp4',
    },
    {
      title: 'Forbedre eller skrive nye setninger og avsnitt med AI-hjelp',
      subtitle: 'Perfekt hvis du står fast, skal skrive om avsnitt eller trenger nye ideer',
      videoSrc: '/videohelp4.mp4',
    },
    {
      title: 'Finne relevant informasjon på nett til din tekst',
      subtitle: 'Du kan enkelt finne relevant informasjon som kan lagres i biblioteket',
      videoSrc: '/videohelp5.mp4',
    }
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full px-6 pb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white p-6 border-b border-gray-200 dark:border-gray-700">
        Video veiledning
      </h2>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {accordionData.map((item, index) => (
          <AccordionItem
            key={index}
            title={item.title}
            subtitle={item.subtitle}
            videoSrc={item.videoSrc}
            isOpen={openAccordion === index}
            toggleAccordion={() => setOpenAccordion(openAccordion === index ? null : index)}
          />
        ))}
      </div>
    </div>
  )
}

export default VideoHelp

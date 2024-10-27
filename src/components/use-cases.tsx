import { BookOpen, FileText, GraduationCap, Pencil, Rocket, Mic, Check } from 'lucide-react'

export default function UseCases() {
  const useCases = [
    {
      icon: <FileText className="w-4 h-4 text-[#06f] stroke-2" />,
      title: "Essays",
      description: "Innhold.AI hjelper deg med å skrive bedre essays ved å analysere teksten din og gi forbedringsforslag.",
      features: ["Korrekturlesing", "AI Autocomplete"]
    },
    {
      icon: <BookOpen className="w-4 h-4 text-[#06f] stroke-2" />,
      title: "SEO-artikler",
      description: "Innhold.AI optimaliserer dine SEO-artikler ved å analysere og forbedre innholdet for bedre synlighet.",
      features: ["Interlink", "Oppdatert data fra web"]
    },
    {
      icon: <GraduationCap className="w-4 h-4 text-[#06f] stroke-2" />,
      title: "Analyser & Rapporter",
      description: "Innhold.AI forbedrer dine analyser og rapporter ved å tilby presis data og innsikt med forbedringsforslag.",
      features: ["Enklere data innsamling", "Rask kildehenvisning"]
    },
    {
      icon: <Rocket className="w-4 h-4 text-[#06f] stroke-2" />,
      title: "Studentoppgaver",
      description: "Innhold.AI hjelper deg med studentoppgaver ved å gi forbedringsforslag, AI-hjelp og korrekte kildehenvisninger.",
      features: ["Kildehenvisning + AI", "AI Autocomplete"]
    },
    {
      icon: <Pencil className="w-4 h-4 text-[#06f] stroke-2" />,
      title: "Blogginnlegg",
      description: "Innhold.AI hjelper deg med å skrive engasjerende blogginnlegg ved å gi forbedringsforslag og optimalisere innholdet.",
      features: ["SEO-optimalisert", "Effektiv skriving"]
    },
    {
      icon: <Mic className="w-4 h-4 text-[#06f] stroke-2" />,
      title: "Lengre tekster",
      description: "Innhold.AI lærer din skrivestil og produserer bedre forslag med høy kvalitet slik at du kan skrive mer effektivt.",
      features: ["Sitat og kilder", "Tilbakemelding i sanntid"]
    },
  ]

  return (
    <section className="md:w-full bg-gray-100 dark:bg-[#111827] py-12 sm:py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xs font-semibold text-[#06f] dark:text-[#3b82f6] mb-2">BRUKSOMRÅDER</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">Du har kontrollen</h3>
          <p className="text-lg sm:text-xl text-muted-foreground dark:text-gray-300 mb-8 sm:mb-12">Typer innhold AI kan hjelpe deg med</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="flex flex-col items-start bg-white dark:bg-gray-700 p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="bg-gray-100 dark:bg-gray-600 rounded-full p-2 mr-3">
                  {useCase.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">{useCase.title}</h4>
              </div>
              <p className="text-muted-foreground dark:text-gray-300 mb-4" style={{ fontSize: '0.9rem' }}>{useCase.description}</p>
              {useCase.features && (
                <div className="w-full flex flex-wrap gap-2.5">
                  {useCase.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="w-3 h-3 mr-1 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 font-semibold" style={{ fontSize: '0.75rem' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

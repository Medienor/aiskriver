import { BookOpen, FileText, GraduationCap, Pencil, Rocket, Mic } from 'lucide-react'

export default function UseCases() {
  const useCases = [
    {
      icon: <FileText className="w-6 h-6 text-[#06f]" />,
      title: "Essays",
      description: "Innhold.AI hjelper deg med å skrive bedre essays ved å analysere teksten din og gi forbedringsforslag.",
    },
    {
      icon: <BookOpen className="w-6 h-6 text-[#06f]" />,
      title: "SEO-artikler",
      description: "Innhold.AI optimaliserer dine SEO-artikler ved å analysere og forbedre innholdet for bedre synlighet.",
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-[#06f]" />,
      title: "Analyser & Rapporter",
      description: "Innhold.AI forbedrer dine analyser og rapporter ved å tilby presis data og innsikt med forbedringsforslag.",
    },
    {
      icon: <Rocket className="w-6 h-6 text-[#06f]" />,
      title: "Studentoppgaver",
      description: "Innhold.AI hjelper deg med studentoppgaver ved å gi forbedringsforslag, AI-hjelp og korrekte kildehenvisninger.",
    },
    {
      icon: <Pencil className="w-6 h-6 text-[#06f]" />,
      title: "Blogginnlegg",
      description: "Innhold.AI hjelper deg med å skrive engasjerende blogginnlegg ved å gi forbedringsforslag og optimalisere innholdet.",
    },
    {
      icon: <Mic className="w-6 h-6 text-[#06f]" />,
      title: "Lengre tekster",
      description: "Innhold.AI lærer din skrivestil og produserer lengre tekster med høy kvalitet.",
    },
  ]

  return (
    <section className="w-full bg-gray-100 py-16 pb-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold text-[#06f] mb-2">BRUKSOMRÅDER</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-4">Du har kontrollen</h3>
          <p className="text-xl text-muted-foreground mb-12">Typer innhold AI kan hjelpe deg med</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="flex flex-col items-start">
              <div className="bg-white rounded-full p-4 shadow-sm">
                {useCase.icon}
              </div>
              <h4 className="text-xl font-semibold mt-4 mb-2">{useCase.title}</h4>
              <p className="text-muted-foreground">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
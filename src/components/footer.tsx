import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Youtube, Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-transparent text-gray-600 dark:text-gray-300 py-8">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">AI-skriveverktøy</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-gray-800 dark:hover:text-gray-100">Artikkelskriver</Link></li>
              <li><Link href="/tools/article-rewriter" className="hover:text-gray-800 dark:hover:text-gray-100">Artikkel omskriver</Link></li>
              <li><Link href="/plagiat-sjekker" className="hover:text-gray-800 dark:hover:text-gray-100">Plagiatkontroll</Link></li>
              <li><Link href="/tools/sentence-expander" className="hover:text-gray-800 dark:hover:text-gray-100">Setningsutvidelse</Link></li>
              <li><Link href="/tools/plagiarism-remover" className="hover:text-gray-800 dark:hover:text-gray-100">Plagiatfjerner</Link></li>
              <li><Link href="/tools/essay-writer" className="hover:text-gray-800 dark:hover:text-gray-100">Essayskriver</Link></li>
              <li><Link href="/tools/paraphrasing-tool" className="hover:text-gray-800 dark:hover:text-gray-100">AI parafrasering</Link></li>
              <li><Link href="/tools/ai-writer" className="hover:text-gray-800 dark:hover:text-gray-100">AI tekstskriver</Link></li>
              <li><Link href="/tools/resume-bio-generator" className="hover:text-gray-800 dark:hover:text-gray-100">AI CV og Søknad</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Alternativer</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">Jasper Alternativ</Link></li>
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">Copy.ai Alternativ</Link></li>
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">ChatGPT Alternativ</Link></li>
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">Wordtune Alternativ</Link></li>
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">QuillBot Alternativ</Link></li>
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">Writesonic Alternativ</Link></li>
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">Rytr Alternativ</Link></li>
              <li><Link href="/comparison/innholdai-vs-notion-ai" className="hover:text-gray-800 dark:hover:text-gray-100">Notion AI Alternativ</Link></li>
              <li><Link href="#" className="hover:text-gray-800 dark:hover:text-gray-100">Flere alternativer</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Ressurser</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/kontakt" className="hover:text-gray-800 dark:hover:text-gray-100">Kontakt oss</Link></li>
              <li><Link href="/brukervilkar" className="hover:text-gray-800 dark:hover:text-gray-100">Brukervilkår</Link></li>
              <li><Link href="/bli-affiliate" className="hover:text-gray-800 dark:hover:text-gray-100">Bli Affiliate</Link></li>
              <li><Link href="/personvern" className="hover:text-gray-800 dark:hover:text-gray-100">Personvern</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-full md:w-auto">
              <div className="flex justify-center md:justify-end space-x-4">
                <Link href="#" aria-label="Facebook"><Facebook size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" /></Link>
                <Link href="#" aria-label="Twitter"><Twitter size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" /></Link>
                <Link href="#" aria-label="LinkedIn"><Linkedin size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" /></Link>
                <Link href="#" aria-label="YouTube"><Youtube size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" /></Link>
                <Link href="#" aria-label="Instagram"><Instagram size={20} className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" /></Link>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-between items-center">
            <p className="text-sm">&copy; 2024 INNHOLD.AI | MEDIENOR AS</p>
            <div className="mt-2 md:mt-0">
              <select className="text-sm bg-transparent border border-gray-300 dark:border-gray-700 rounded px-2 py-1">
                <option>Norsk Bokmål</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Star, Check, Zap, Search, Shield, ArrowRight } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const testimonials = [
  {
    name: "Ola Nordmann",
    role: "Innholdsskaper",
    content: "Innhold.AI har revolusjonert måten jeg skriver på. Det sparer meg for timer hver dag!",
    image: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    name: "Kari Hansen",
    role: "Markedssjef",
    content: "Kvaliteten på innholdet er imponerende. Det er som å ha en profesjonell forfatter på laget.",
    image: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    name: "Per Olsen",
    role: "Blogger",
    content: "Plagiatsjekk-funksjonen gir meg ro i sinnet. Jeg vet at innholdet mitt alltid er originalt.",
    image: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    name: "Lisa Andersen",
    role: "SEO-spesialist",
    content: "SEO-optimaliseringen er topp! Artiklene rangerer høyt i søkeresultatene.",
    image: "https://randomuser.me/api/portraits/women/2.jpg"
  },
];

const benefits = [
  { title: "Spar tid", description: "Generer innhold raskt og effektivt" },
  { title: "Øk produktivitet", description: "Skap mer innhold på kortere tid" },
  { title: "Forbedre SEO", description: "Optimaliser innhold for søkemotorer" },
  { title: "Unngå plagiat", description: "Sikre at innholdet ditt er originalt" },
  { title: "Konsistent tone", description: "Oppretthold en konsekvent merkevare-stemme" },
  { title: "Flerspråklig støtte", description: "Skap innhold på flere språk" },
  { title: "Tilpass for målgrupper", description: "Skap innhold for spesifikke målgrupper" },
  { title: "Reduser kostnader", description: "Kutt ned på utgifter til innholdsproduksjon" },
  { title: "Øk engasjement", description: "Skap mer engasjerende innhold" },
  { title: "Alltid tilgjengelig", description: "Skap innhold når som helst, hvor som helst" },
  { title: "Skalerbar løsning", description: "Voks med dine innholdsbehov" },
  { title: "Kontinuerlig forbedring", description: "Dra nytte av stadig forbedret AI-teknologi" },
];

const StarRating = () => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleButtonClick = () => {
    if (session) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Innhold.AI</h1>
          <h2 className="text-4xl font-bold mb-4">Skriv innhold raskere med AI</h2>
          <p className="text-xl mb-8">Generer høykvalitets artikler, blogginnlegg og mer med vår kraftige AI-skriveverktøy.</p>
          <div className="flex justify-center items-center space-x-4 mb-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleButtonClick}>
              {session ? "Skriv innhold" : "Prøv Innhold.AI gratis"}
            </Button>
            <Link href="/pricing" passHref>
              <Button size="lg" variant="outline" className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                Se priser
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            <Check className="w-4 h-4 mr-2 text-green-500" />
            Ikke behov for kredittkort
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Zap className="w-6 h-6 mr-2 text-blue-500" />
              <h3 className="text-2xl font-semibold">Rask generering</h3>
            </div>
            <p>Skap innhold på sekunder med vår avanserte AI-teknologi.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Search className="w-6 h-6 mr-2 text-blue-500" />
              <h3 className="text-2xl font-semibold">SEO-optimalisert</h3>
            </div>
            <p>Få innhold som rangerer høyt i søkemotorer.</p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 mr-2 text-blue-500" />
              <h3 className="text-2xl font-semibold">Plagiatsjekk</h3>
            </div>
            <p>Sikre at innholdet ditt er 100% unikt og originalt.</p>
          </div>
        </div>

        {/* Testimonial Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Hva våre kunder sier</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
                <StarRating />
                <p className="mt-4 mb-4 italic">&quot;{testimonial.content}&quot;</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Fordeler med Innhold.AI</h2>
          <p className="text-center mb-8 text-gray-600 dark:text-gray-400">Oppdag hvordan Innhold.AI kan transformere din innholdsproduksjon</p>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-bold mb-8">Kom i gang i dag</h2>
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleButtonClick}>
            {session ? "Skriv innhold" : "Prøv Innhold.AI gratis"} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Footer removed */}
    </div>
  );
}
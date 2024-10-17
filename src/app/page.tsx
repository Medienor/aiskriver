'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { Star, Check, Zap, Search, Shield, ArrowRight, Info } from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SlidingBlocks from "@/components/sliding-blocks"
import { Clock, TrendingUp, MessageSquare, Globe, Users, DollarSign, Heart, ArrowUpRight, RefreshCw } from 'lucide-react';
import Footer from '@/components/footer';
import UseCases from '@/components/use-cases';
import PlagiatRowSection from '@/components/PlagiatRowSection';

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

const userGroups = [
  "Lærere", "Studenter", "Bloggere", "Markedsførere", "Forfattere", "Journalister", "Innholdsskapere"
];

const benefitIcons = {
  "Spar tid": <Clock className="w-5 h-5" />,
  "Øk produktivitet": <TrendingUp className="w-5 h-5" />,
  "Forbedre SEO": <Search className="w-5 h-5" />,
  "Unngå plagiat": <Shield className="w-5 h-5" />,
  "Konsistent tone": <MessageSquare className="w-5 h-5" />,
  "Flerspråklig støtte": <Globe className="w-5 h-5" />,
  "Tilpass for målgrupper": <Users className="w-5 h-5" />,
  "Reduser kostnader": <DollarSign className="w-5 h-5" />,
  "Øk engasjement": <Heart className="w-5 h-5" />,
  "Alltid tilgjengelig": <Clock className="w-5 h-5" />,
  "Skalerbar løsning": <ArrowUpRight className="w-5 h-5" />,
  "Kontinuerlig forbedring": <RefreshCw className="w-5 h-5" />,
};


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
      router.push('/write');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <main className="flex flex-col items-center">
        <div className="w-full max-w-6xl px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">AI som skriver for deg</h1>
            <p className="text-xl mb-8">Generer høykvalitets artikler, blogginnlegg og mer med vår kraftige AI-skriveverktøy.</p>

            <div className="mb-12 flex justify-center"> {/* Changed mb-8 to mb-12 */}
              <div className="w-[300px] relative overflow-hidden">
                <p className="text-sm font-semibold mb-2" style={{ fontSize: '0.8rem' }}>Passer godt for:</p>
                <div className="flex animate-marquee">
                  {userGroups.concat(userGroups).map((group, index) => (
                    <span
                      key={index}
                      className="mx-2 py-1 px-3 bg-gray-200 dark:bg-gray-700 rounded-full text-xs transition-all duration-300 ease-in-out hover:bg-blue-500 hover:text-white cursor-pointer flex-shrink-0"
                    >
                      {group}
                    </span>
                  ))}
                </div>
                <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-gray-900 to-transparent"></div>
                <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-gray-900 to-transparent"></div>
              </div>
            </div>

            <div className="flex justify-center items-center mb-4">
              <Button 
                size="lg" 
                className="px-8 py-6 text-xl font-semibold"
                style={{
                  borderWidth: '2px',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderStyle: 'solid',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(241deg, #0066ff 0%, #0052cc 100%)',
                  opacity: 1,
                  boxShadow: '0px 0px 16px 4px rgba(0, 102, 255, 0.15)',
                }}
                onClick={handleButtonClick}
              >
                <span>{session ? "Skriv innhold" : "Prøv Innhold.AI gratis"}</span>
                <span className="ml-2 text-sm font-normal opacity-80">- Gratis</span> {/* Added opacity-80 */}
              </Button>
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
        </div>

        {/* Use Cases Section */}
        <UseCases />

        {/* Call to Action Section */}
        <div className="w-full bg-[#1a1c28] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Kom i gang i dag</h2>
            <div className="max-w-lg mx-auto mb-8">
              <p className="text-lg text-gray-300 opacity-70">
                Innhold.AI har også utviklet over 120 verktøy som gjør det enklere for deg å produsere original tekst
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-6 text-xl font-semibold"
                style={{
                  borderWidth: '2px',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  borderStyle: 'solid',
                  borderRadius: '0.5rem',
                  background: 'linear-gradient(241deg, #0066ff 0%, #0052cc 100%)',
                  opacity: 1,
                  boxShadow: '0px 0px 16px 4px rgba(0, 102, 255, 0.15)',
                }}
                onClick={handleButtonClick}
              >
                <span>{session ? "Skriv innhold" : "Prøv Innhold.AI gratis"}</span>
                <span className="ml-2 text-sm font-normal opacity-80">- Gratis</span>
              </Button>
              <Link href="/tools" passHref className="text-white opacity-70 hover:opacity-100 transition-opacity text-sm">
                Se 120+ skriveverktøy
              </Link>
            </div>
          </div>
        </div>

        {/* PlagiatRowSection */}
        <PlagiatRowSection />

        {/* SlidingBlocks component */}
        <div className="w-full py-16">
          <div className="max-w-6xl mx-auto px-4">
            <SlidingBlocks />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="w-full bg-gray-100 dark:bg-gray-800 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Fordeler med Innhold.AI</h2>
            <p className="text-center mb-12 text-gray-600 dark:text-gray-400">Oppdag hvordan Innhold.AI kan transformere din innholdsproduksjon</p>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <span className="text-blue-500 mr-2">
                      {benefitIcons[benefit.title as keyof typeof benefitIcons]}
                    </span>
                    <h3 className="text-sm font-semibold text-blue-500">{benefit.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="w-full py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-8">Spørsmål og svar</h2>
            <div className="space-y-4">
              {[
                { question: "Hva er Innhold.AI?", answer: "Innhold.AI er et banebrytende AI-verktøy designet for å gjøre skriveprosessen både enklere og mer effektiv. Med vår populære tjeneste kan du raskt generere tekst for en rekke formål, enten det gjelder skoleoppgaver, SEO-artikler eller akademiske papirer. Dette gir deg muligheten til å fokusere på det du virkelig brenner for, samtidig som du sparer verdifull tid som ellers ville gått med til research og skriving. En av de mest tiltalende aspektene ved Innhold.AI er det omfattende utvalget av over 120 forskjellige verktøy vi tilbyr. Disse verktøyene er utviklet for å effektivisere måten du skriver på, og de er designet med brukerens behov i tankene. Enten du trenger hjelp med å skrive fengende overskrifter, lage innholdsfortegnelser eller optimalisere teksten din for søkemotorer, har Innhold.AI verktøyene som kan hjelpe deg med å oppnå dine mål. Det beste av alt? Innhold.AI er helt gratis å bruke. Hver bruker får hele 5 000 ord inkludert når du registrerer en profil hos oss, noe som gir deg god anledning til å utforske verktøyene og oppdage hvordan de kan forbedre din skriveopplevelse. Uansett om du er student som ønsker å imponere læreren din med velartikulerte oppgaver, eller en profesjonell som jobber med innhold for nettsider, er Innhold.AI den ideelle partneren i din skriveprosess. Bli en del av vårt voksende samfunn av brukere i dag, og oppdag hvordan Innhold.AI kan revolusjonere måten du produserer tekst på." },
                { question: "Hvordan fungerer Innhold.AI?", answer: "Innhold.AI bruker kjente språkmodeller fra Claude, GPT-3.5 og GPT-4o, som effektiviserer hvordan du kan skrive tekst på. Disse avanserte modellene er utviklet for å forstå og generere menneskelig språk, noe som gjør dem til kraftige verktøy for både profesjonelle og hobbyforfattere. Enten du er på jakt etter hjelp til å utarbeide en klar og overbevisende artikkel, eller om du ønsker å perfeksjonere et kreativt prosjekt, kan disse språkmodellene tilpasse seg dine behov og gi deg kvalitetsinnhold raskt. I tillegg har Innhold.AI en egen database som kontinuerlig trener seg opp på norsk tekst. Denne databasen er designet med fokus på å sikre at du alltid får korrekt og presis tekst, tilpasset det norske språkets nyanser og idiomer. Dette gjør det lettere for brukere å skrive med trygghet, vel vitende om at innholdet som genereres ikke bare er grammatisk korrekt, men også kulturelt relevant. Med Innhold.AI kan du dermed forvente et effektivt og pålitelig verktøy som støtter deg i dine skriveprosjekter, uansett omfang eller tema." },
                { question: "Hvilke typer innhold kan Innhold.AI generere?", answer: "Innhold.AI er en revolusjonerende plattform som lar brukere generere alt av innhold relatert til tekst, uten at man trenger å være en skrivende mester. Denne tjenesten har utviklet et hovedverktøy som gjør det utrolig enkelt for deg å skrive innsiktsfulle og engasjerende artikler. Enten du er en ivrig blogger som vil ha en SEO-optimalisert artikkel for å tiltrekke flere lesere, eller en student som står overfor krevende akademiske oppgaver og trenger hjelp til å strukturere et dokument, kan vår tjeneste tilby den nødvendige støtten for å få ideene dine ned på papir. Du kan tilpasse innholdet etter egne preferanser; det er ikke bare en standardmal. Vårt system gir deg muligheten til å finjustere artikkelen i henhold til dine spesifikke ønsker. Du kan bestemme hvordan teksten skal presenteres – fra formelt til uformelt, eller fra informativt til overbevisende. Videre kan du velge hvilken tonefall du ønsker å bruke, som kan være alt fra lystig og lett til seriøs og akademisk. For å gjøre oppgaven enda enklere, kan du spesifisere målgruppen for teksten, slik at innholdet treffer riktig demografi og engasjerer leserne på best mulige måter. I tillegg kan du velge hvilket språk teksten skal skrives på, noe som gjør at vi kan imøtekomme både lokale og internasjonale behov. Med Innhold.AI får du ikke bare hjelp til å skrive; du får et verktøy som forvandler skriveprosessen til en kreativ og inspirerende opplevelse. Mulighetene er nærmest uendelige, og med denne tjenesten er du klappet klar for å ta innholdet ditt til nye høyder." },
                { question: "Er innholdet som genereres unikt?", answer: "Ja, alt innhold generert av Innhold.AI er unikt og originalt. Vi har også en innebygd plagiatkontroll for å sikre dette." },
                { question: "Hvor raskt kan Innhold.AI generere innhold?", answer: "Innhold.AI kan generere innhold på sekunder, avhengig av lengden og kompleksiteten av innholdet som etterspørres." },
                { question: "Kan jeg tilpasse innholdet som genereres?", answer: "Absolutt! Du kan gi spesifikke instruksjoner og preferanser for å sikre at innholdet passer din merkevare og målgruppe." },
                { question: "Er Innhold.AI egnet for SEO?", answer: "Ja, Innhold.AI er designet med SEO i tankene og kan hjelpe deg med å skape innhold som er optimalisert for søkemotorer." },
                { question: "Hvilke språk støtter Innhold.AI?", answer: "Innhold.AI støtter en rekke språk, inkludert norsk, engelsk, svensk, dansk og mange flere." },
                { question: "Hvordan er prismodellen for Innhold.AI?", answer: "Vi tilbyr flere prisplaner for å passe ulike behov, fra enkeltpersoner til store bedrifter. Se vår prisside for mer informasjon." },
                { question: "Er det en gratis prøveperiode?", answer: "Ja, vi tilbyr en gratis prøveperiode med 5 000 ord for alle nye brukere slik at du kan teste Innhold.AI og se hvordan det kan hjelpe deg med din innholdsproduksjon." },
                { question: "Hvordan sikrer Innhold.AI personvern og datasikkerhet?", answer: "Vi tar personvern og datasikkerhet på alvor. All data er kryptert, og vi følger strenge retningslinjer for å beskytte våre brukeres informasjon." },
                { question: "Kan jeg integrere Innhold.AI med andre verktøy?", answer: "Ja, Innhold.AI tilbyr API-er og integrasjoner med populære verktøy for innholdshåndtering og markedsføring." },
                { question: "Tilbyr dere tekst omskriving?", answer: "Ja, Innhold.AI tilbyr en kraftig funksjon for tekstomskriving. Dette verktøyet kan hjelpe deg med å omformulere eksisterende tekst for å forbedre klarhet, unngå plagiat, eller tilpasse tonen til et annet publikum. Vår AI kan omskrive alt fra korte avsnitt til lengre artikler, samtidig som den bevarer den opprinnelige meningen. Vi tilbyr både artikkel omskriving og paragraf omskriver for å møte dine ulike behov." },
                { question: "Er plagiatkontroll gratis?", answer: "Ja, plagiatkontroll er inkludert gratis i Innhold.AI med 10 søk hver bruker, dersom du vil ha flere plagitatsøk må du kjøpe en av våre pakker. Vår innebygde plagiatsjekk-funksjon sikrer at alt innhold du genererer er unikt og originalt. Dette verktøyet er tilgjengelig for alle brukere uten ekstra kostnad, og gir deg trygghet om at innholdet ditt er fritt for utilsiktet plagiering." },
                { question: "Innhold.AI eller ChatGPT?", answer: "Mens både Innhold.AI og ChatGPT er kraftige AI-verktøy, er Innhold.AI spesielt designet for innholdsproduksjon og optimalisert for norsk språk. Innhold.AI tilbyr over 120 spesialiserte verktøy for ulike skriveoppgaver, inkludert SEO-optimalisering og plagiatkontroll. I motsetning til ChatGPT, som er en generell chatbot, er Innhold.AI skreddersydd for å møte spesifikke behov innen innholdsproduksjon, med funksjoner som tekstomskriving og målrettet innholdsgenerering. Dessuten har Innhold.AI en egen database som kontinuerlig trener seg opp på norsk tekst, noe som sikrer høy kvalitet og relevans for norske brukere." }
              ].map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <button
                    className="flex justify-between items-center w-full"
                    onClick={() => {
                      const content = document.getElementById(`content-${index}`);
                      if (content) {
                        content.classList.toggle('hidden');
                      }
                    }}
                  >
                    <span className="font-medium text-lg md:text-base">{item.question}</span>
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  <div id={`content-${index}`} className="hidden mt-2">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4">
        <Footer />
      </div>
    </div>
  );
}
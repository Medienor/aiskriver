import React from 'react';
import Link from 'next/link';
import Footer from '@/components/footer';

export default function Brukervilkar() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex-grow py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Brukervilkår for Innhold.AI</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              Ved å bruke vår tjeneste godtar du følgende vilkår:
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-4">Innholdsfortegnelse</h2>
            <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 mb-6">
              {Array.from({ length: 26 }, (_, i) => (
                <li key={i}>
                  <a href={`#section-${i + 1}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {[
                      "Våre tjenester", "Immaterielle rettigheter", "Brukerrepresentasjoner", "Brukerregistrering",
                      "Kjøp og betaling", "Kansellering", "Forbudte aktiviteter", "Brukergenerert innhold",
                      "Lisens for bidrag", "Sosiale medier", "Tredjepartsnettsteder og -innhold", "Administrasjon av tjenestene",
                      "Personvernpolicy", "Varighet og oppsigelse", "Endringer og avbrudd", "Gjeldende lov",
                      "Tvisteløsning", "Korreksjoner", "Ansvarsfraskrivelse", "Ansvarsbegrensning",
                      "Skadesløsholdelse", "Brukerdata", "Elektronisk kommunikasjon, transaksjoner og signaturer",
                      "Diverse", "Kontakt oss", "Angrerett"
                    ][i]}
                  </a>
                </li>
              ))}
            </ol>

            {[
              { title: "Våre tjenester", content: "Innhold.AI, levert av Medienor AS (org.nr. 924 303 263), er en tjeneste som bruker åpne Large Language Models for å generere innhold og svare på spørsmål. Tjenesten er ment som et hjelpemiddel for å effektivisere skriving og arbeid, ikke som et verktøy for å jukse på prøver eller erstatte originalt arbeid under studier og i jobbsammenheng." },
              { title: "Immaterielle rettigheter", content: "Alle immaterielle rettigheter tilknyttet Innhold.AI tilhører Medienor AS eller våre lisensgivere. Du må ikke kopiere, modifisere eller distribuere noen del av tjenesten uten vår skriftlige tillatelse." },
              { title: "Brukerrepresentasjoner", content: "Ved å bruke Innhold.AI bekrefter du at du er myndig eller har foresattes tillatelse, og at all informasjon du gir er sann og nøyaktig." },
              { title: "Brukerregistrering", content: "For å få tilgang til visse funksjoner kan du bli bedt om å registrere deg. Du er ansvarlig for å holde din kontoinformasjon konfidensiell." },
              { title: "Kjøp og betaling", content: "Detaljer om priser og betalingsvilkår vil bli gitt før eventuelle kjøp. Alle betalinger er underlagt gjeldende norske lover og forskrifter." },
              { title: "Kansellering", content: "Informasjon om kansellering av abonnementer eller tjenester vil bli gitt separat i våre betalingsvilkår." },
              { title: "Forbudte aktiviteter", content: "Du må ikke bruke Innhold.AI til ulovlige eller uautoriserte formål, inkludert, men ikke begrenset til, å jukse på prøver eller misbruke AI-generert innhold i akademiske eller profesjonelle sammenhenger uten proper attribusjon." },
              { title: "Brukergenerert innhold", content: "Du er ansvarlig for alt innhold du laster opp eller genererer gjennom Innhold.AI. Vi forbeholder oss retten til å fjerne innhold som bryter våre retningslinjer." },
              { title: "Lisens for bidrag", content: "Ved å laste opp eller generere innhold gjennom Innhold.AI, gir du Medienor AS en verdensomspennende, ikke-eksklusiv, royalty-fri lisens til å bruke, reprodusere og distribuere dette innholdet i forbindelse med tjenesten og for å forbedre våre språkmodeller." },
              { title: "Sosiale medier", content: "Hvis du velger å koble din Innhold.AI-konto til sosiale medier-plattformer, er du ansvarlig for å overholde vilkårene for disse plattformene." },
              { title: "Tredjepartsnettsteder og -innhold", content: "Innhold.AI kan inneholde lenker til tredjepartsnettsteder. Vi er ikke ansvarlige for innholdet eller praksisene til disse nettstedene." },
              { title: "Administrasjon av tjenestene", content: "Vi forbeholder oss retten til å endre, suspendere eller avslutte Innhold.AI uten varsel." },
              { title: "Personvernpolicy", content: "Vår behandling av personopplysninger er beskrevet i vår separate personvernerklæring." },
              { title: "Varighet og oppsigelse", content: "Disse vilkårene gjelder så lenge du bruker Innhold.AI. Vi kan avslutte eller suspendere din tilgang umiddelbart, uten forvarsel eller ansvar, av enhver grunn." },
              { title: "Endringer og avbrudd", content: "Vi kan endre Innhold.AI eller disse vilkårene når som helst. Vi er ikke ansvarlige for eventuelle avbrudd eller endringer i tjenesten." },
              { title: "Gjeldende lov", content: "Disse vilkårene er underlagt norsk lov." },
              { title: "Tvisteløsning", content: "Eventuelle tvister som oppstår i forbindelse med disse vilkårene skal først forsøkes løst gjennom forhandlinger. Hvis dette ikke lykkes, skal tvisten løses ved norske domstoler." },
              { title: "Korreksjoner", content: "Vi forbeholder oss retten til å rette eventuelle feil, unøyaktigheter eller utelatelser, og til å endre eller oppdatere informasjon når som helst uten forvarsel." },
              { title: "Ansvarsfraskrivelse", content: "Innhold.AI leveres \"som den er\" uten noen form for garanti, verken uttrykt eller underforstått." },
              { title: "Ansvarsbegrensning", content: "Medienor AS er ikke ansvarlig for indirekte tap eller følgeskader som oppstår som følge av bruk av Innhold.AI." },
              { title: "Skadesløsholdelse", content: "Du samtykker i å holde Medienor AS og dets ledere, direktører, ansatte og agenter skadesløse fra ethvert krav eller krav som oppstår ut fra din bruk av Innhold.AI." },
              { title: "Brukerdata", content: "Vi kan bruke informasjon fra artikler du genererer for å trene vår språkmodell videre. Se vår personvernerklæring for mer informasjon om hvordan vi håndterer brukerdata." },
              { title: "Elektronisk kommunikasjon, transaksjoner og signaturer", content: "Bruk av Innhold.AI innebærer din aksept av elektronisk kommunikasjon fra oss. Du samtykker til at alle avtaler, varsler, avsløringer og andre kommunikasjoner vi gir deg elektronisk, tilfredsstiller eventuelle juridiske krav om at slik kommunikasjon skal være skriftlig." },
              { title: "Diverse", content: "Hvis noen del av disse vilkårene anses ugyldige eller ikke kan håndheves, skal de resterende bestemmelsene forbli i full kraft og effekt." },
              { title: "Kontakt oss", content: "For spørsmål om Innhold.AI eller disse brukervilkårene, vennligst kontakt oss på: josef@medienor.no" },
              { title: "Angrerett", content: "I henhold til norsk lov har forbrukere rett til å gå fra avtalen innen 14 dager uten å oppgi noen grunn for tjenester som ikke er fullstendig levert. Se vår separate angreretts-policy for mer informasjon." }
            ].map((section, index) => (
              <section key={index} id={`section-${index + 1}`}>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-4">
                  {index + 1}. {section.title}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {section.content}
                </p>
              </section>
            ))}

            <p className="text-gray-700 dark:text-gray-300 mt-6">
              Ved å bruke Innhold.AI bekrefter du at du har lest, forstått og godtatt disse brukervilkårene.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-4">
              Sist oppdatert: 21.09.2024
            </p>
          </div>
        </div>
        
        <div className="mt-16">
          <Footer />
        </div>
      </div>
    </div>
  );
}
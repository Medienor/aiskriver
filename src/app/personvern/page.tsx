import React from 'react';
import Link from 'next/link';
import Footer from '@/components/footer';

export default function Personvernerklaring() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Personvernerklæring for Innhold.AI</h1>
        
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
          Sist oppdatert: 21. september 2024
        </p>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Denne personvernerklæringen for Medienor AS ("Selskapet", "vi", "oss" eller "vår") beskriver hvordan og hvorfor vi kan samle inn, lagre, bruke og/eller dele ("behandle") din informasjon når du bruker våre tjenester ("Tjenester"), for eksempel når du:
        </p>

        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-6">
          <li>Besøker vårt nettsted på https://innhold.ai, eller ethvert nettsted som lenker til denne personvernerklæringen</li>
          <li>Bruker vår AI-drevne innholdsgenererings-tjeneste</li>
          <li>Engasjerer deg med oss på andre relaterte måter, inkludert salg, markedsføring eller arrangementer</li>
        </ul>

        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Spørsmål eller bekymringer? Å lese denne personvernerklæringen vil hjelpe deg å forstå dine personvernrettigheter og valg. Hvis du ikke er enig i våre retningslinjer og praksis, vennligst ikke bruk våre Tjenester. Hvis du fortsatt har spørsmål eller bekymringer, vennligst kontakt oss på josef@medienor.no.
        </p>

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">SAMMENDRAG AV HOVEDPUNKTER</h2>

        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Dette sammendraget gir deg hovedpunktene fra vår personvernerklæring, men du kan finne mer detaljert informasjon om hvert av disse temaene ved å klikke på lenken etter hvert hovedpunkt eller ved å bruke vår innholdsfortegnelse nedenfor.
        </p>

        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">Innholdsfortegnelse</h3>
        <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 mb-6">
          <li><a href="#info-vi-samler" className="text-blue-600 dark:text-blue-400 hover:underline">Hvilken informasjon samler vi inn?</a></li>
          <li><a href="#info-behandling" className="text-blue-600 dark:text-blue-400 hover:underline">Hvordan behandler vi din informasjon?</a></li>
          <li><a href="#juridisk-grunnlag" className="text-blue-600 dark:text-blue-400 hover:underline">På hvilket juridisk grunnlag behandler vi din personlige informasjon?</a></li>
          <li><a href="#info-deling" className="text-blue-600 dark:text-blue-400 hover:underline">Når og med hvem deler vi din personlige informasjon?</a></li>
          <li><a href="#sosiale-medier" className="text-blue-600 dark:text-blue-400 hover:underline">Hvordan håndterer vi dine innlogginger via sosiale medier?</a></li>
          <li><a href="#info-lagring" className="text-blue-600 dark:text-blue-400 hover:underline">Hvor lenge oppbevarer vi din informasjon?</a></li>
          <li><a href="#info-sikkerhet" className="text-blue-600 dark:text-blue-400 hover:underline">Hvordan beskytter vi din informasjon?</a></li>
          <li><a href="#mindreårige" className="text-blue-600 dark:text-blue-400 hover:underline">Samler vi inn informasjon fra mindreårige?</a></li>
          <li><a href="#personvern-rettigheter" className="text-blue-600 dark:text-blue-400 hover:underline">Hva er dine personvernrettigheter?</a></li>
          <li><a href="#oppdateringer" className="text-blue-600 dark:text-blue-400 hover:underline">Oppdaterer vi denne erklæringen?</a></li>
          <li><a href="#kontakt" className="text-blue-600 dark:text-blue-400 hover:underline">Hvordan kan du kontakte oss om denne erklæringen?</a></li>
          <li><a href="#data-gjennomgang" className="text-blue-600 dark:text-blue-400 hover:underline">Hvordan kan du gjennomgå, oppdatere eller slette dataene vi samler inn fra deg?</a></li>
        </ol>

        <section id="info-vi-samler">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">1. HVILKEN INFORMASJON SAMLER VI INN?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vi samler personlig informasjon som du frivillig gir til oss når du registrerer deg på Tjenestene, uttrykker interesse for å motta informasjon om oss eller våre produkter og Tjenester, når du deltar i aktiviteter på Tjenestene, eller når du kontakter oss.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Personlig informasjon gitt av deg</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Den personlige informasjonen vi samler inn avhenger av sammenhengen av dine interaksjoner med oss og Tjenestene, valgene du tar, og produktene og funksjonene du bruker. Den personlige informasjonen vi samler kan inkludere følgende:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>E-postadresser</li>
            <li>Passord</li>
            <li>Betalingsinformasjon</li>
            <li>Kontakt- eller autentiseringsinformasjon</li>
            <li>Brukergenerert innhold (tekster produsert ved hjelp av vår AI-tjeneste)</li>
          </ul>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Sensitiv informasjon</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vi behandler ikke sensitive personopplysninger.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Betalingsinformasjon</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vi kan samle inn data som er nødvendig for å behandle din betaling hvis du foretar kjøp, som ditt betalingsinstrumentnummer og sikkerhetskoden tilknyttet ditt betalingsinstrument. All betalingsinformasjon lagres av vår betalingsleverandør, Stripe. Du kan finne deres personvernerklæring her: https://stripe.com/privacy.
          </p>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">Informasjon automatisk innhentet</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vi samler automatisk inn viss informasjon når du besøker, bruker eller navigerer på Tjenestene. Denne informasjonen avslører ikke din spesifikke identitet (som ditt navn eller kontaktinformasjon), men kan inkludere enhets- og bruksinformasjon, som din IP-adresse, nettleser- og enhetsegenskaper, operativsystem, språkpreferanser, henvisende URL-er, enhetsnavn, land, lokasjon, informasjon om hvordan og når du bruker våre Tjenester, og annen teknisk informasjon. Denne informasjonen er primært nødvendig for å opprettholde sikkerheten og driften av våre Tjenester, og for våre interne analyse- og rapporteringsformål.
          </p>
        </section>

        <section id="info-behandling">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">2. HVORDAN BEHANDLER VI DIN INFORMASJON?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vi behandler din personlige informasjon for ulike formål, avhengig av hvordan du samhandler med våre Tjenester, inkludert:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>For å tilrettelegge for kontoopprettelse og autentisering og på annen måte administrere brukerkontoer</li>
            <li>For å levere og lette levering av tjenester til brukeren, inkludert vår AI-drevne innholdsgenerering</li>
            <li>For å svare på brukerforespørsler og tilby support til brukere</li>
            <li>For å sende administrativ informasjon til deg</li>
            <li>For å oppfylle og administrere dine bestillinger</li>
            <li>For å be om tilbakemeldinger</li>
            <li>For å sende deg markedsførings- og promoteringsmeddelelser, hvis dette er i samsvar med dine markedsføringspreferanser</li>
            <li>For å beskytte våre Tjenester</li>
            <li>For å identifisere brukstrender og forbedre våre Tjenester</li>
          </ul>
        </section>

        <section id="juridisk-grunnlag">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">3. PÅ HVILKET JURIDISK GRUNNLAG BEHANDLER VI DIN PERSONLIGE INFORMASJON?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vi behandler din personlige informasjon kun når vi mener det er nødvendig og vi har et gyldig juridisk grunnlag for å gjøre det under gjeldende lov, som:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>Samtykke: Vi kan behandle din informasjon hvis du har gitt oss tillatelse (dvs. samtykke) til å bruke din personlige informasjon for et spesifikt formål.</li>
            <li>Oppfyllelse av en kontrakt: Vi kan behandle din personlige informasjon når vi mener det er nødvendig for å oppfylle våre kontraktsmessige forpliktelser overfor deg, inkludert å levere våre Tjenester.</li>
            <li>Legitime interesser: Vi kan behandle din informasjon når vi mener det er rimelig nødvendig for å oppnå våre legitime forretningsinteresser, og disse interessene ikke overstiger dine interesser og grunnleggende rettigheter og friheter.</li>
            <li>Rettslige forpliktelser: Vi kan behandle din informasjon der vi mener det er nødvendig for å overholde våre rettslige forpliktelser.</li>
            <li>Vitale interesser: Vi kan behandle din informasjon der vi mener det er nødvendig for å beskytte dine vitale interesser eller vitale interesser til en tredjepart.</li>
          </ul>
        </section>

        <section id="info-deling">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">4. NÅR OG MED HVEM DELER VI DIN PERSONLIGE INFORMASJON?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Vi kan dele informasjon i spesifikke situasjoner og med følgende tredjeparter:
          </p>
          <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
            <li>Tjenesteleverandører: Vi kan dele din informasjon med tjenesteleverandører som utfører tjenester for oss eller på våre vegne.</li>
            <li>Betalingsbehandlere: Vi deler betalingsinformasjon med betalingsbehandlere for å fullføre transaksjoner.</li>
            <li>Forretningsoverføringer: Vi kan dele eller overføre din informasjon i forbindelse med, eller under forhandlinger om, enhver fusjon, salg av selskapets eiendeler, finansiering eller oppkjøp av hele eller deler av vår virksomhet til et annet selskap.</li>
          </ul>
        </section>

        <section id="sosiale-medier">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">5. HVORDAN HÅNDTERER VI DINE INNLOGGINGER VIA SOSIALE MEDIER?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Våre Tjenester tilbyr deg muligheten til å registrere deg og logge inn ved hjelp av din tredjeparts sosiale mediekonto (som Facebook- eller Google-innlogging). Når du velger å gjøre dette, vil vi motta visse profilinformasjon om deg fra din sosiale medieleverandør. Profilinformasjonen vi mottar kan variere avhengig av den sosiale medieleverandøren det gjelder, men vil ofte inkludere ditt navn, e-postadresse, venneliste og profilbilde, så vel som annen informasjon du velger å gjøre offentlig på en slik sosial medieplattform.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Vi vil bruke informasjonen vi mottar kun for de formålene som er beskrevet i denne personvernerklæringen eller som på annen måte er gjort klart for deg på de relevante Tjenestene. Vær oppmerksom på at vi ikke kontrollerer, og ikke er ansvarlige for, annen bruk av din personlige informasjon av din tredjeparts sosiale medieleverandør. Vi anbefaler at du gjennomgår deres personvernerklæring for å forstå hvordan de samler inn, bruker og deler din personlige informasjon, og hvordan du kan stille inn dine personvernpreferanser på deres nettsteder og apper.
      </p>
    </section>

    <section id="info-lagring">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">6. HVOR LENGE OPPBEVARER VI DIN INFORMASJON?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Vi vil kun beholde din personlige informasjon så lenge det er nødvendig for formålene som er beskrevet i denne personvernerklæringen, med mindre en lengre oppbevaringsperiode er påkrevd eller tillatt ved lov (som skatte-, regnskaps- eller andre juridiske krav). Ingen hensikt i denne erklæringen vil kreve at vi beholder din personlige informasjon lenger enn trettiseks (36) måneder etter at brukerens konto er avsluttet.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Når vi ikke har noen pågående legitim forretningsbehov for å behandle din personlige informasjon, vil vi enten slette eller anonymisere slik informasjon, eller, hvis dette ikke er mulig (for eksempel fordi din personlige informasjon har blitt lagret i backup-arkiver), vil vi sikkert lagre din personlige informasjon og isolere den fra videre behandling inntil sletting er mulig.
      </p>
    </section>

    <section id="info-sikkerhet">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">7. HVORDAN BESKYTTER VI DIN INFORMASJON?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Vi har implementert passende og rimelige tekniske og organisatoriske sikkerhetstiltak designet for å beskytte sikkerheten til all personlig informasjon vi behandler. Imidlertid, til tross for våre sikkerhetstiltak og innsats for å sikre din informasjon, kan ingen elektronisk overføring over Internett eller informasjonslagringsteknologi garanteres å være 100% sikker, så vi kan ikke love eller garantere at hackere, cyberkriminelle eller andre uautoriserte tredjeparter ikke vil være i stand til å overvinne vår sikkerhet og urettmessig samle inn, få tilgang til, stjele eller endre din informasjon. Selv om vi vil gjøre vårt beste for å beskytte din personlige informasjon, er overføring av personlig informasjon til og fra våre Tjenester på egen risiko. Du bør kun få tilgang til Tjenestene innenfor et sikkert miljø.
      </p>
    </section>

    <section id="mindreårige">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">8. SAMLER VI INN INFORMASJON FRA MINDREÅRIGE?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Vi samler ikke bevisst inn data fra eller markedsfører til barn under 15 år. Ved å bruke Tjenestene, representerer du at du er minst 15 år eller at du er forelder eller verge til en slik mindreårig og samtykker til slik mindreårigs avhengiges bruk av Tjenestene. Hvis vi lærer at personlig informasjon fra brukere mindre enn 15 år gamle har blitt samlet inn, vil vi deaktivere kontoen og ta rimelige tiltak for å slette slike data fra våre registre omgående. Hvis du blir oppmerksom på data vi kan ha samlet inn fra barn under 15 år, vennligst kontakt oss på josef@medienor.no.
      </p>
    </section>

    <section id="personvern-rettigheter">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">9. HVA ER DINE PERSONVERNRETTIGHETER?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        I Norge har du følgende rettigheter under personopplysningsloven:
      </p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
        <li>Rett til innsyn i personopplysninger vi har om deg</li>
        <li>Rett til å korrigere personopplysninger</li>
        <li>Rett til å slette personopplysninger</li>
        <li>Rett til å begrense behandlingen av personopplysninger</li>
        <li>Rett til å protestere mot behandling av personopplysninger</li>
        <li>Rett til dataportabilitet</li>
        <li>Rett til å trekke tilbake samtykke</li>
      </ul>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Hvis du ønsker å utøve noen av disse rettighetene, vennligst kontakt oss ved å bruke kontaktdetaljene oppgitt i seksjonen "HVORDAN KAN DU KONTAKTE OSS OM DENNE ERKLÆRINGEN?" nedenfor. Vi vil svare på din forespørsel i henhold til gjeldende personvernlovgivning.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Hvis du mener at vi ulovlig behandler din personlige informasjon, har du også rett til å klage til Datatilsynet. Du kan finne deres kontaktdetaljer her: https://www.datatilsynet.no/
      </p>
    </section>

    <section id="oppdateringer">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">10. OPPDATERER VI DENNE ERKLÆRINGEN?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Ja, vi vil oppdatere denne erklæringen etter behov for å holde oss i samsvar med relevante lover. Når vi gjør endringer i denne personvernerklæringen, vil vi endre "Sist oppdatert"-datoen øverst i denne personvernerklæringen. I enkelte tilfeller kan vi også informere deg om endringer ved å sende deg en e-post eller på annen måte.
      </p>
    </section>

    <section id="kontakt">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">11. HVORDAN KAN DU KONTAKTE OSS OM DENNE ERKLÆRINGEN?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Hvis du har spørsmål eller kommentarer om denne erklæringen, kan du sende en e-post til oss på josef@medienor.no eller per post til:
      </p>
      <address className="text-gray-700 dark:text-gray-300 mb-4">
        Medienor AS<br />
        Hesselbergsgate 9B<br />
        0555 Oslo<br />
        Norge
      </address>
    </section>

    <section id="data-gjennomgang">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4">12. HVORDAN KAN DU GJENNOMGÅ, OPPDATERE ELLER SLETTE DATAENE VI SAMLER INN FRA DEG?</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Basert på personopplysningsloven har du rett til å be om innsyn i personopplysningene vi samler om deg, endre denne informasjonen eller slette den. For å be om å gjennomgå, oppdatere eller slette dine personopplysninger, vennligst send en forespørsel til josef@medienor.no.
      </p>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Vi vil svare på din forespørsel innen 30 dager. I enkelte tilfeller kan vi be om ytterligere informasjon for å bekrefte din identitet før vi behandler forespørselen.
      </p>
    </section>

    <p className="text-gray-700 dark:text-gray-300 mt-8">
      Ved å bruke våre Tjenester, godtar du vilkårene i denne personvernerklæringen. Hvis du ikke er enig i vilkårene i denne erklæringen, vennligst ikke bruk våre Tjenester.
    </p>
    
        <Footer />
      </section>
    </div>
  );
}
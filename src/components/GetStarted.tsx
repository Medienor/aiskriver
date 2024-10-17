import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GetStarted() {
  return (
    <Card className="w-full max-w-4xl mx-auto overflow-y-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Velkommen til Innhold.AI</CardTitle>
        <p className="text-muted-foreground">
          Lær hvordan Innhold.AI kan hjelpe deg med å skrive bedre og raskere.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <section>
            <h3 className="text-2xl font-semibold mb-3">AI Autofullføring</h3>
            <p className="text-muted-foreground">
              Autofullføring hjelper deg å skrive raskere og overkomme skrivesperre. Innhold.AI vil foreslå neste
              tekstlinje. Trykk på &apos;-&gt;&apos; for å godta eller &apos;CMD/CTRL + -&gt;&apos; for å se et alternativ.
            </p>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-3">AI Chat</h3>
            <p className="text-muted-foreground">
              Snakk med dokumentet ditt, få tips fra Innhold.AI til hvordan du kan forbedre artikkelen. Du kan også 
              bruke internett søk ved å taste inn @ først, lagre kildene dine slik at de havner i biblioteket så du 
              kan bruke dem igjen i artikkelen.
            </p>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-3">Biblioteket</h3>
            <p className="text-muted-foreground">
              Her samler du alt av relevant informasjon som brukes i artikkelen. Tekstene blir omformulert slik at 
              ingenting er kopiert direkte fra kilden. Legg til kildehenvisninger og bruk relevant data i ditt 
              dokument mens du skriver.
            </p>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-3">AI-kommandoer</h3>
            <p className="text-muted-foreground mb-2">
              Vil du omformulere, omskrive eller forenkle tekst? AI-kommandoer har deg dekket. Det er to måter å
              bruke AI-kommandoer på:
            </p>
            <ul className="list-disc list-inside text-muted-foreground">
              <li>For å endre eksisterende tekst, merk den og velg alternativet fra verktøylinjen</li>
              <li>
                For å generere en ny tekstblokk, velg AI-kommandoer fra den nederste verktøylinjen når markøren er
                på en ny/tom blokk
              </li>
            </ul>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-3">Innholdsinnstillinger</h3>
            <p className="text-muted-foreground">
              Finjuster forslag ved å legge inn en beskrivelse og angi ønsket referanseformat (APA, MLA, Harvard,
              IEEE).
            </p>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-3">Plagieringskontroll</h3>
            <p className="text-muted-foreground">
              Få sinnsro ved å kjøre dokumentet ditt gjennom vår plagieringskontroll. All potensielt plagiert tekst
              vil bli uthevet.
            </p>
          </section>
          <section>
            <h3 className="text-2xl font-semibold mb-3">Trenger du mer hjelp?</h3>
            <p className="text-muted-foreground">
              Klikk på &apos;?&apos;-ikonet og velg &apos;send oss en melding&apos;. Teamet vil være glad for å hjelpe.
            </p>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
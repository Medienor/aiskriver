import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShortcutHelp() {
  const snarveier = [
    {
      title: "Godta et forslag",
      description: "Bruk høyre piltast for å godta et forslag",
      keys: ["→"],
    },
    {
      title: "Bla gjennom forslag",
      description: "Bruk Shift + høyre piltast for å bla til neste forslag",
      keys: ["Shift", "→"],
    },
    {
      title: "Genererer AI-setning",
      description: "Fungerer etter setninger som f.eks punktum eller komma",
      smallText: true,
      keys: ["CTRL", "→"],
    },
    {
      title: "Genererer AI-paragraf",
      description: "Fungerer på nye linjer som er tomme",
      smallText: true,
      keys: ["CTRL", "↓"],
    },
    {
      title: "Gjør tekst tykkere",
      description: "Gjør markert tekst fet",
      keys: ["CTRL", "B"],
    },
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Tastatursnarveier</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {snarveier.map((snarvei, index) => (
            <div key={index} className="grid grid-cols-[1fr,auto] gap-4 items-center">
              <div>
                <h3 className="text-lg font-semibold">{snarvei.title}</h3>
                <p className={`text-sm ${snarvei.smallText ? 'text-xs' : ''} text-gray-500`}>
                  {snarvei.description}
                </p>
              </div>
              <div className="flex items-center space-x-1 justify-end">
                {snarvei.keys.map((key, keyIndex) => (
                  <React.Fragment key={keyIndex}>
                    {keyIndex > 0 && (
                      <span className="text-gray-400 text-xs">+</span>
                    )}
                    <span
                      className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-gray-700 bg-gray-100 rounded-[0.25rem] border border-gray-300 min-w-[1.5rem]"
                    >
                      {key}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

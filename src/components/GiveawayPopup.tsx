import { useState } from 'react'
import { X, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function SharePopup() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-blue-50 rounded-lg shadow-lg max-w-md w-full relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            Hvordan fungerer det?
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-medium">Del Innhold.AI på sosiale medier</p>
              <p className="text-sm text-green-600"><Check size={16} className="inline mr-1" /> GPT-4o + 2000 ord</p>
            </div>
            <div>
              <p className="font-medium">Inviter 1 venn til å registrere seg</p>
              <p className="text-sm text-green-600"><Check size={16} className="inline mr-1" /> GPT-4o + 2000 ord</p>
            </div>
            <div>
              <p className="font-medium">Inviter 1 venn til å abonnere</p>
              <p className="text-sm text-green-600"><Check size={16} className="inline mr-1" /> Tjen 30% provisjon. <a href="#" className="text-blue-500">Inviter nå.</a></p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center bg-white rounded border p-2">
              <input
                type="text"
                value="https://innhold.ai/?c=KWOAAU"
                readOnly
                className="flex-grow bg-transparent outline-none"
              />
              <Button 
                variant="default" 
                size="sm"
                className="bg-[#06f] hover:bg-[#05d] text-white"
              >
                Kopier
              </Button>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm text-blue-600">
            <a href="#" className="hover:underline">Se flere belønninger</a>
            <a href="#" className="hover:underline">Sjekk dine belønninger</a>
          </div>
        </div>
      </div>
    </div>
  )
}
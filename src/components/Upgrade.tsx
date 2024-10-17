import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import Image from 'next/image'

interface UpgradeProps {
  isOpen: boolean;
  onClose: () => void;
  isSidePanelMinimized: boolean;
}

const Upgrade: React.FC<UpgradeProps> = ({ isOpen, onClose, isSidePanelMinimized }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const monthlyPrice = 299;
  const yearlyPrice = 199;
  const savingsPercentage = Math.round((1 - (yearlyPrice * 12) / (monthlyPrice * 12)) * 100);

  const handleUpgrade = () => {
    const stripeLink = selectedPlan === 'monthly' 
      ? 'https://buy.stripe.com/5kA9D27Yi6i70tqbIW'
      : 'https://buy.stripe.com/eVa9D23I2dKza4014j';
    window.open(stripeLink, '_blank');
  };

  // Generate avatar URLs only once
  const avatarUrls = useMemo(() => [
    `https://i.pravatar.cc/32?img=${Math.floor(Math.random() * 70)}`,
    `https://i.pravatar.cc/32?img=${Math.floor(Math.random() * 70)}`,
    `https://i.pravatar.cc/32?img=${Math.floor(Math.random() * 70)}`
  ], []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`bg-white rounded-lg overflow-hidden max-w-4xl w-full mx-4 ${isSidePanelMinimized ? 'ml-12' : 'ml-56'}`}
            style={{
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 bg-[#F4F3FF] p-8 flex items-center justify-center">
                    <Image
                      src="/images/innhold.svg"
                      alt="Tegneseriefigur med ballonger"
                      width={256}
                      height={256}
                    />
                  </div>
                  <div className="w-full md:w-1/2 p-8 relative bg-white">
                    <button 
                      onClick={onClose}
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    >
                      <X size={24} />
                    </button>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">Oppgrader</h2>
                    <p className="text-gray-600 mb-6">
                    Oppnå grenseløs inspirasjon med vår Premium-pakke. Si hade til skrivesperren!
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-center">
                        <Check className="text-green-500 mr-2" />
                        <span className="text-gray-900">Ubegrenset AI-generering</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="text-green-500 mr-2" />
                        <span className="text-gray-900">Innhold.AI AI-assistent</span>
                      </li>
                      <li className="flex items-center">
                        <Check className="text-green-500 mr-2" />
                        <span className="text-gray-900">Ubegrenset ord</span>
                      </li>
                    </ul>
                    <div className="space-y-4 mb-6">
                      <Button 
                        className={`w-full justify-between border ${
                          selectedPlan === 'yearly' ? 'border-[#0066ff] bg-white' : 'border-gray-200 bg-white'
                        } hover:border-[#0066ff] hover:shadow-sm transition-all duration-200 hover:bg-white`}
                        onClick={() => setSelectedPlan('yearly')}
                      >
                        <span className="text-gray-900">Årlig</span>
                        <span className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            Spar {savingsPercentage}%
                          </span>
                          <span className="text-gray-900">{yearlyPrice} kr</span>
                          <span className="text-gray-500 text-sm">/mnd</span>
                        </span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className={`w-full justify-between border ${
                          selectedPlan === 'monthly' ? 'border-[#0066ff] bg-white' : 'border-gray-200 bg-white'
                        } hover:border-[#0066ff] hover:shadow-sm transition-all duration-200 hover:bg-white`}
                        onClick={() => setSelectedPlan('monthly')}
                      >
                        <span className="text-gray-900">Månedlig</span>
                        <span>
                          <span className="text-gray-900">{monthlyPrice} kr</span>
                          <span className="text-gray-500 text-sm">/mnd</span>
                        </span>
                      </Button>
                    </div>
                    <Button 
                      className="w-full bg-[#0066ff] hover:bg-[#0052cc] text-white"
                      onClick={handleUpgrade}
                    >
                      Oppgrader nå
                    </Button>
                    <div className="mt-6 flex items-center justify-center">
                      <div className="flex -space-x-2">
                        {avatarUrls.map((url, index) => (
                          <img
                            key={index}
                            alt="Brukeravatar"
                            className="w-8 h-8 rounded-full border-2 border-white"
                            src={url}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 ml-2">
                        Skriv og jobb raskere med Innhold.AI
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Upgrade

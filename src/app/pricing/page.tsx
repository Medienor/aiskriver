'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface PricingTierProps {
  title: string;
  monthlyPrice: number;
  features: string[];
  isPopular?: boolean;
  isAnnual: boolean;
  stripeLinkMonthly: string;
  stripeLinkYearly: string;
}

const PricingTier: React.FC<PricingTierProps> = ({ 
  title, 
  monthlyPrice, 
  features, 
  isPopular = false, 
  isAnnual, 
  stripeLinkMonthly, 
  stripeLinkYearly 
}) => {
  const yearlyPrice = Math.round(monthlyPrice * 0.8);
  const displayPrice = isAnnual ? yearlyPrice : monthlyPrice;
  const stripeLink = isAnnual ? stripeLinkYearly : stripeLinkMonthly;

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ${isPopular ? 'border-2 border-blue-500 dark:border-blue-400' : ''}`}>
      {isPopular && <div className="text-blue-500 dark:text-blue-400 font-bold mb-2">Mest Populær</div>}
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
      <p className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">{displayPrice} kr</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        per måned
      </p>
      <ul className="mb-6 space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-gray-700 dark:text-gray-300">
            <svg className="w-4 h-4 mr-2 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <a href={stripeLink} target="_blank" rel="noopener noreferrer" className="w-full">
        <Button className="w-full bg-[#06f] hover:bg-blue-700 text-white">
          {isPopular ? 'Prøv det ut gratis' : 'Velg pakke'}
        </Button>
      </a>
      {isAnnual && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Du blir fakturert for hele beløpet ved start
        </p>
      )}
    </div>
  )
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const pricingTiers = [
    {
      title: "Starter",
      monthlyPrice: 250,
      features: [
        "45 000 ord per måned",
        "Grunnleggende AI-skriveverktøy",
        "E-poststøtte"
      ],
      stripeLinkMonthly: "https://buy.stripe.com/8wM02s7Yi0XNb849AA",
      stripeLinkYearly: "https://buy.stripe.com/8wM02s7Yi0XNb849AA"
    },
    {
      title: "Pro",
      monthlyPrice: 490,
      features: [
        "100 000 ord per måned",
        "Avanserte AI-skriveverktøy",
        "Prioritert e-poststøtte",
        "SEO-optimalisering"
      ],
      isPopular: true,
      stripeLinkMonthly: "https://buy.stripe.com/3cs3eEbau0XNa408wx",
      stripeLinkYearly: "https://buy.stripe.com/3cs3eEbau0XNa408wx"
    },
    {
      title: "Boost",
      monthlyPrice: 990,
      features: [
        "Ubegrenset antall ord",
        "Alle Pro-funksjoner",
        "Dedikert kontoansvarlig",
        "Tilpasset AI-modelltrening"
      ],
      stripeLinkMonthly: "https://buy.stripe.com/14kbLa3I28qfekg7su",
      stripeLinkYearly: "https://buy.stripe.com/14kbLa3I28qfekg7su"
    },
    {
      title: "Vekst",
      monthlyPrice: 1800,
      features: [
        "200 000 ord per måned",
        "Grunnleggende AI-skriveverktøy",
        "E-poststøtte",
        "Innholdsmaler"
      ],
      stripeLinkMonthly: "https://buy.stripe.com/cN27uUemGcGv1xueUX",
      stripeLinkYearly: "https://buy.stripe.com/cN27uUemGcGv1xueUX"
    },
    {
      title: "Elite",
      monthlyPrice: 3490,
      features: [
        "800 000 ord per måned",
        "Avanserte AI-skriveverktøy",
        "Prioritert støtte",
        "Teamsamarbeidsfunksjoner"
      ],
      stripeLinkMonthly: "https://buy.stripe.com/dR63eEfqK7mbekg148",
      stripeLinkYearly: "https://buy.stripe.com/dR63eEfqK7mbekg148"
    },
    {
      title: "Super",
      monthlyPrice: 4990,
      features: [
        "1 500 000 ord per måned",
        "Alle Bedrift-funksjoner",
        "API-tilgang",
        "Tilpassede integrasjoner"
      ],
      stripeLinkMonthly: "https://buy.stripe.com/7sI9D22DYayn2ByeUZ",
      stripeLinkYearly: "https://buy.stripe.com/7sI9D22DYayn2ByeUZ"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Enkel, transparent prising</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Velg planen som passer best for deg</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vi tilbyr både månedlig og årlig fakturering. Årlig fakturering gir deg 20% rabatt, og du får alle kreditter på forhånd for maksimal fleksibilitet!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'}`}>Årlig</span>
            <Switch
              checked={!isAnnual}
              onCheckedChange={() => setIsAnnual(!isAnnual)}
            />
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'}`}>Månedlig</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <PricingTier
              key={index}
              title={tier.title}
              monthlyPrice={tier.monthlyPrice}
              features={tier.features}
              isPopular={tier.isPopular}
              isAnnual={isAnnual}
              stripeLinkMonthly={tier.stripeLinkMonthly}
              stripeLinkYearly={tier.stripeLinkYearly}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
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
}

const PricingTier: React.FC<PricingTierProps> = ({ title, monthlyPrice, features, isPopular = false, isAnnual }) => {
  const annualPrice = monthlyPrice * 12 * 0.8; // 20% discount for annual
  const displayPrice = isAnnual ? annualPrice : monthlyPrice * 1.2; // 20% increase for monthly

  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg ${isPopular ? 'border-2 border-blue-500 dark:border-blue-400' : ''}`}>
      {isPopular && <div className="text-blue-500 dark:text-blue-400 font-bold mb-2">Most Popular</div>}
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
      <p className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">${displayPrice.toFixed(2)}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        {isAnnual ? `$${monthlyPrice.toFixed(2)} / month` : 'per month'}
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
      <Button className="w-full bg-[#06f] hover:bg-blue-700 text-white">
        {isPopular ? 'Start Free Trial' : 'Choose Plan'}
      </Button>
    </div>
  )
}

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true);

  const pricingTiers = [
    {
      title: "Basic",
      monthlyPrice: 9,
      features: [
        "1,000 words per month",
        "Basic AI writing tools",
        "Email support"
      ]
    },
    {
      title: "Pro",
      monthlyPrice: 29,
      features: [
        "10,000 words per month",
        "Advanced AI writing tools",
        "Priority email support",
        "SEO optimization"
      ],
      isPopular: true
    },
    {
      title: "Enterprise",
      monthlyPrice: 99,
      features: [
        "Unlimited words",
        "All Pro features",
        "Dedicated account manager",
        "Custom AI model training"
      ]
    },
    {
      title: "Starter",
      monthlyPrice: 19,
      features: [
        "5,000 words per month",
        "Basic AI writing tools",
        "Email support",
        "Content templates"
      ]
    },
    {
      title: "Team",
      monthlyPrice: 79,
      features: [
        "50,000 words per month",
        "Advanced AI writing tools",
        "Priority support",
        "Team collaboration features"
      ]
    },
    {
      title: "Custom",
      monthlyPrice: 199,
      features: [
        "Custom word limit",
        "All Enterprise features",
        "API access",
        "Custom integrations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Choose the plan that&apos;s right for you</p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We offer both monthly and annual billing options. Annual billing allows you to save 20% and you get all credits up front for maximum flexibility!
          </p>
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'}`}>Annual</span>
            <Switch
              checked={!isAnnual}
              onCheckedChange={() => setIsAnnual(!isAnnual)}
            />
            <span className={`text-sm ${!isAnnual ? 'text-gray-900 dark:text-white font-bold' : 'text-gray-500 dark:text-gray-400'}`}>Monthly</span>
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
            />
          ))}
        </div>
      </div>
    </div>
  )
}
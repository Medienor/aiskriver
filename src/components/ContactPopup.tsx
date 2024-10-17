'use client'

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { sendTelegramMessage } from '@/services/TelegramService'

interface ContactPopupProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'contact' | 'feedback';
}

export default function ContactPopup({ isOpen, onClose, type }: ContactPopupProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const telegramMessage = `${type === 'contact' ? 'Kontakt' : 'Tilbakemelding'}:\nNavn: ${formData.name}\nEpost: ${formData.email}\nMelding: ${formData.message}`
    
    try {
      await sendTelegramMessage(telegramMessage)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Failed to send message:', error)
      // You might want to show an error message to the user here
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  if (!isOpen) return null;

  const popup = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        {!isSubmitted && (
          <h2 className="text-2xl font-bold mb-4">
            {type === 'contact' ? 'Kontakt oss' : 'Send tilbakemelding'}
          </h2>
        )}
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Navn</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="message">Melding</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Takk for din henvendelse!</h2>
            <p>Vi kommer tilbake til deg så snart som mulig.</p>
            <Button onClick={onClose} className="mt-4">
              Lukk
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(popup, document.body);
}
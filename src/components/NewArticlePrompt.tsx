import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewArticlePrompt({ onClose }: { onClose: () => void }) {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      if (!response.ok) throw new Error('Failed to generate article')
      const { id } = await response.json()
      router.push(`/write/${id}`)
    } catch (error) {
      console.error('Error generating article:', error)
      alert('Failed to generate article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your article prompt here..."
        className="w-full h-32 p-2 border rounded"
        required
      />
      <div className="mt-4 flex justify-between">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isLoading ? 'Generating...' : 'Generate Article'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
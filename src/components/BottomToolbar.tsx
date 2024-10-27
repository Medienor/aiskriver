import React, { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from '../lib/supabase'

interface BottomToolbarProps {
  onUndo: () => void
  onRedo: () => void
  wordCount: number
  canUndo: boolean
  canRedo: boolean
  isGenerationComplete: boolean
  onUpdateWordCount: () => void
  userEmail: string
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({ 
  onUndo, 
  onRedo, 
  wordCount, 
  canUndo, 
  canRedo,
  isGenerationComplete,
  onUpdateWordCount,
  userEmail
}) => {
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null)
  const [personalFeedback, setPersonalFeedback] = useState('')
  const [isFeedbackBoxOpen, setIsFeedbackBoxOpen] = useState(false)
  const [hasFeedbackBeenChecked, setHasFeedbackBeenChecked] = useState(false)
  const [showFeedbackBox, setShowFeedbackBox] = useState(false)

  useEffect(() => {
    if (isGenerationComplete) {
      onUpdateWordCount()
    }
  }, [isGenerationComplete, onUpdateWordCount])

  useEffect(() => {
    const checkFeedbackSubmission = async () => {
      if (!userEmail) return

      const { data, error } = await supabase
        .from('feedback')
        .select('id')
        .eq('user_email', userEmail)
        .limit(1)

      if (error) {
        console.error('Error checking feedback submission:', error)
      } else {
        setIsFeedbackBoxOpen(data.length === 0)
      }
      setHasFeedbackBeenChecked(true)
    }

    checkFeedbackSubmission()
  }, [userEmail])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowFeedbackBox(true)
    }, 60000) // 60000 milliseconds = 1 minute

    return () => clearTimeout(timer)
  }, [])

  const handleFeedbackSubmit = async (score: number) => {
    setFeedbackScore(score)

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([
          { user_email: userEmail, score: score }
        ])
      if (error) throw error
      console.log('Feedback score submitted successfully')
    } catch (error) {
      console.error('Error submitting feedback score:', error)
    }
  }

  const submitPersonalFeedback = async () => {
    if (!feedbackScore) return

    try {
      const { error } = await supabase
        .from('feedback')
        .update({ personal_feedback: personalFeedback })
        .eq('user_email', userEmail)
        .eq('score', feedbackScore)
      if (error) throw error
      console.log('Personal feedback updated successfully')
      setIsFeedbackBoxOpen(false)
    } catch (error) {
      console.error('Error updating personal feedback:', error)
    }
  }

  const closeFeedbackBox = () => {
    setIsFeedbackBoxOpen(false)
  }

  if (!hasFeedbackBeenChecked) {
    return null // or a loading indicator
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 z-10">
      {/* Feedback box */}
      {isFeedbackBoxOpen && showFeedbackBox && (
        <div className="absolute bottom-full left-0 right-0 mb-4">
          <div className="max-w-[800px] mx-auto px-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-lg relative w-[350px] mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={closeFeedbackBox}
              >
                <X className="h-4 w-4" />
              </Button>
              {feedbackScore === null ? (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Var det enkelt å bruke tjenesten?
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        size="sm"
                        onClick={() => handleFeedbackSubmit(num)}
                        className={`w-6 h-6 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300`}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="mt-2 w-full flex space-x-2">
                  <Input
                    placeholder="Fortell oss mer (valgfritt)"
                    value={personalFeedback}
                    onChange={(e) => setPersonalFeedback(e.target.value)}
                    className="flex-grow dark:bg-gray-700 dark:text-white text-sm"
                    style={{ fontSize: '0.875rem' }}
                  />
                  <Button 
                    onClick={submitPersonalFeedback} 
                    className="dark:bg-gray-600 dark:text-white text-sm px-3 py-1"
                  >
                    Send
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Toolbar */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 bg-opacity-80 dark:bg-opacity-80 backdrop-blur-sm py-2">
        <div className="max-w-[800px] mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onUndo} 
                disabled={!canUndo}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onRedo} 
                disabled={!canRedo}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
              >
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {wordCount} ord
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BottomToolbar

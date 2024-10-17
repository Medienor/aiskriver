import React, { useEffect } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface BottomToolbarProps {
  onUndo: () => void
  onRedo: () => void
  wordCount: number
  canUndo: boolean
  canRedo: boolean
  isGenerationComplete: boolean // New prop
  onUpdateWordCount: () => void // New prop for updating word count
}

const BottomToolbar: React.FC<BottomToolbarProps> = ({ 
  onUndo, 
  onRedo, 
  wordCount, 
  canUndo, 
  canRedo,
  isGenerationComplete,
  onUpdateWordCount
}) => {
  useEffect(() => {
    if (isGenerationComplete) {
      onUpdateWordCount()
    }
  }, [isGenerationComplete, onUpdateWordCount])

  if (!isGenerationComplete) {
    return null // Don't render anything if generation is not complete
  }

  return (
    <div className="sticky bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white bg-opacity-80 dark:bg-transparent backdrop-blur-sm py-1 z-10">
      <div className="max-w-[800px] mx-auto flex justify-between items-center px-4">
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
  )
}

export default BottomToolbar
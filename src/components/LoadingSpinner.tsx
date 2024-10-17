import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
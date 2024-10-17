import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Upgrade from '@/components/Upgrade'

interface WordLimitNotificationProps {
  onClose: () => void
}

const WordLimitNotification: React.FC<WordLimitNotificationProps> = ({ onClose }) => {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleUpgradeClick = () => {
    setShowUpgrade(true)
  }

  const handleUpgradeClose = () => {
    setShowUpgrade(false)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="fixed bottom-16 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-sm z-50"
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">Ord-grense nådd</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <p className="mb-4">
          Desverre så er du tom for ord. Du kan oppgradere for å få flere ord inkludert.
        </p>
        <div className="flex flex-col items-start">
          <Button 
            className="bg-[#06f] hover:bg-[#05d] text-white"
            onClick={handleUpgradeClick}
          >
            Oppgrader nå
          </Button>
          <p className="text-xs text-gray-400 mt-2">
            Du kan fortsette å skrive uten AI helt gratis
          </p>
        </div>
      </motion.div>
      <Upgrade 
        isOpen={showUpgrade} 
        onClose={handleUpgradeClose} 
        isSidePanelMinimized={false}
      />
    </>
  )
}

export default WordLimitNotification

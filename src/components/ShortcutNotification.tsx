import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutNotificationProps {
  show: boolean;
  onClose: () => void;
}

const ShortcutNotification: React.FC<ShortcutNotificationProps> = ({ show, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed left-0 right-0 flex justify-center"
          style={{ 
            zIndex: 9999, // Maximum z-index
            top: '5%', // Adjust this value to move it further down
          }}
        >
          <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-md">
            <p className="mb-2">Gratulerer! Du har nå lært å bruke snarveier som gjør jobben mye lettere.</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsVisible(false);
                  onClose();
                }}
                className="bg-white text-blue-500 px-3 py-1 rounded text-sm hover:bg-blue-100"
              >
                OK
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShortcutNotification;
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface CopyNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

const CopyNotification: React.FC<CopyNotificationProps> = ({ isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center space-x-2"
        >
          <Check className="text-green-500" size={18} />
          <span className="text-gray-800 font-medium">Teksten er kopiert</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CopyNotification;

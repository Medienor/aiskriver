import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface StreamingOverlayProps {
  isStreaming: boolean;
  contentRef: React.RefObject<HTMLDivElement>;
}

const StreamingOverlay: React.FC<StreamingOverlayProps> = ({ isStreaming, contentRef }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateOverlayPosition = () => {
      if (contentRef.current && overlayRef.current) {
        const contentRect = contentRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const overlayHeight = Math.min(200, windowHeight - contentRect.top);

        overlayRef.current.style.top = `${contentRect.bottom - overlayHeight}px`;
        overlayRef.current.style.height = `${overlayHeight}px`;
      }
    };

    if (isStreaming) {
      updateOverlayPosition();
      window.addEventListener('resize', updateOverlayPosition);
      const interval = setInterval(updateOverlayPosition, 100); // Update position frequently

      return () => {
        window.removeEventListener('resize', updateOverlayPosition);
        clearInterval(interval);
      };
    }
  }, [isStreaming, contentRef]);

  if (!isStreaming) return null;

  return (
    <motion.div
      ref={overlayRef}
      className="fixed left-0 right-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,1) 100%)',
        backdropFilter: 'blur(5px)',
        zIndex: 10,
      }}
    />
  );
};

export default StreamingOverlay;
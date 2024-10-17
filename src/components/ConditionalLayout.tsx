'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Navbar } from "@/components/Navbar"
import WriteSidePanel from "@/components/WriteSidePanel"
import Upgrade from "@/components/Upgrade"
import WriterNav from "@/components/WriterNav"
import { motion } from 'framer-motion'

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWritePage = pathname?.startsWith('/write');
  const isHomePage = pathname === '/';
  const showWriteSidePanel = isWritePage;
  const [isSidePanelMinimized, setIsSidePanelMinimized] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      setIsSidePanelMinimized(isMobile);
    }

    handleResize(); // Call once to set initial state
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMinimizeChange = (isMinimized: boolean) => {
    console.log('handleMinimizeChange:', isMinimized)
    setIsSidePanelMinimized(isMinimized);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {showWriteSidePanel && (
        <WriteSidePanel 
          onMinimizeChange={handleMinimizeChange} 
          onUpgradeClick={() => setIsUpgradeOpen(true)} 
          initialMinimizedState={isMobileView}
        />
      )}
      <div className="flex flex-col flex-1">
        {!isWritePage && <Navbar />}
        <div className={`flex flex-1 ${!showWriteSidePanel ? 'pt-16' : ''}`}>
          <motion.main
            className="flex-1 w-full bg-white dark:bg-gray-900"
            animate={{ 
              marginLeft: showWriteSidePanel
                ? isSidePanelMinimized
                  ? '3rem'
                  : '14rem'
                : '0'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.main>
        </div>
      </div>
      {showWriteSidePanel && (
        <Upgrade 
          isOpen={isUpgradeOpen} 
          onClose={() => setIsUpgradeOpen(false)} 
          isSidePanelMinimized={isSidePanelMinimized} 
        />
      )}
    </div>
  );
}
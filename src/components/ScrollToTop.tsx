import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

const ScrollToTop = () => {
  const [isScrolling, setIsScrolling] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      // Find the main scrollable element (the main content area in MainLayout)
      const scrollableElement = document.querySelector('main[style*="overflow-y: auto"]') || 
                              document.querySelector('main.overflow-y-auto') ||
                              document.querySelector('main') ||
                              document.documentElement;
      
      // Always scroll to top, even if already at top (to ensure consistency)
      setIsScrolling(true);
      
      // Force immediate scroll on the correct element
      scrollableElement.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
      
      // Hide loading state after a brief moment to ensure scroll is complete
      setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Small delay to ensure the new page content has started rendering
    const timeoutId = setTimeout(scrollToTop, 10);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname, location.search, location.hash]); // Also trigger on hash changes

  // Show loading overlay while scrolling to prevent visual jumps
  if (isScrolling) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return null;
};

export default ScrollToTop;

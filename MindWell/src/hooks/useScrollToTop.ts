import { useEffect } from 'react';

export const useScrollToTop = (dependencies: any[] = []) => {
  useEffect(() => {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    
    // Fallback for immediate scroll
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, dependencies);
};

export default useScrollToTop;

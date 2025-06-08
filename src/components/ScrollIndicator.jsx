import { useState, useEffect } from 'react';
import './ScrollIndicator.css';

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Show indicator if we're at the top and there's content below
      setIsVisible(scrollTop < 100 && documentHeight > windowHeight + 100);
    };

    // Check initially and on scroll
    checkScroll();
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="scroll-indicator" title="Scroll for more content">
      <div className="scroll-arrow">↓</div>
    </div>
  );
};

export default ScrollIndicator; 
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TopProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + (100 - prev) * 0.15;
      });
    }, 150);

    return () => {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => setIsVisible(false), 500);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed top-0 left-0 right-0 h-[3px] bg-primary/20 z-99999 pointer-events-none"
        >
          <motion.div
            className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          />
          
          {/* Shimmer effect */}
          <motion.div 
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent w-24 h-full"
            animate={{ x: ['-100%', '100vw'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopProgressBar;

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function GalloPreloader() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = '';
    }, 1500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="gallo-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF7F2] select-none pointer-events-auto"
        >
          {/* Somente a Logo da Miyashiro Imóveis */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ 
              opacity: 1, 
              scale: [0.94, 1.02, 1],
              transition: { duration: 1.2, ease: 'easeOut' } 
            }}
            exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.3 } }}
            className="flex flex-col items-center"
          >
            <div className="relative w-52 sm:w-64 h-20 sm:h-24">
              <Image
                src="/images/brand/logo.png"
                alt="Miyashiro Imóveis"
                fill
                priority
                className="object-contain"
              />
            </div>

            {/* Linha de progresso minimalista em verde esmeralda */}
            <div className="w-28 sm:w-36 h-0.5 bg-stone-200/90 rounded-full overflow-hidden mt-6">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
                className="w-full h-full bg-[#00873E] rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

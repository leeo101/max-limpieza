'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'right' | 'left';
}

export default function Drawer({ isOpen, onClose, title, children, side = 'right' }: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const variants = {
    closed: { x: side === 'right' ? '100%' : '-100%' },
    open: { x: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          />
          
          {/* Drawer Panel */}
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`absolute top-0 ${side === 'right' ? 'right-0' : 'left-0'} h-full w-full max-w-[400px] bg-white shadow-2xl flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

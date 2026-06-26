'use client';

import { type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) {
  const widths = { sm: 'max-w-[420px]', md: 'max-w-[560px]', lg: 'max-w-[720px]' };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-[16px] md:p-[40px]">
          <motion.div
            className="fixed inset-0 bg-slate-900/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`relative z-10 w-full ${widths[size]} rounded-[16px] bg-white shadow-xl`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-[24px] py-[18px]">
              <h2 className="text-[17px] font-semibold text-slate-900">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex size-[34px] items-center justify-center rounded-[8px] text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="size-[18px]" />
              </button>
            </div>
            <div className="px-[24px] py-[22px]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/admin-toast';

const icons = {
  success: <CheckCircle2 className="size-5 text-emerald-500" />,
  error: <XCircle className="size-5 text-red-500" />,
  info: <Info className="size-5 text-indigo-500" />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  return (
    <div className="pointer-events-none fixed right-[20px] top-[20px] z-[100] flex flex-col gap-[12px]">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex min-w-[280px] items-center gap-[12px] rounded-[12px] border border-slate-200 bg-white px-[16px] py-[14px] shadow-lg"
          >
            {icons[t.type]}
            <span className="flex-1 text-[14px] text-slate-700">{t.message}</span>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

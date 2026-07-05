import React from 'react';

/** Luxury global loader for all Next.js route transitions. */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background px-4">
      {/* Inline styles for custom premium loading animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes luxuryPulse {
              0%, 100% { opacity: 0.35; transform: scale(0.98); }
              50% { opacity: 1; transform: scale(1); }
            }
            @keyframes luxuryBar {
              0% { left: -100%; }
              50% { left: 0%; }
              100% { left: 100%; }
            }
            .animate-luxury-pulse {
              animation: luxuryPulse 2.2s cubic-bezier(0.25, 1, 0.5, 1) infinite;
            }
            .animate-luxury-bar {
              animation: luxuryBar 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          `,
        }}
      />

      <div className="flex flex-col items-center gap-6">
        {/* Luxury Pulsing Serif Brand Mark */}
        <span className="font-serif text-5xl font-light tracking-[0.35em] text-foreground animate-luxury-pulse select-none">
          MTK
        </span>

        {/* Elegant Minimalist Accent Loading Line */}
        <div className="relative h-[2px] w-36 overflow-hidden rounded-full bg-muted">
          <div className="absolute inset-y-0 bg-accent animate-luxury-bar w-full rounded-full" />
        </div>

        {/* Subtle status label */}
        <p className="text-[11px] font-sans uppercase tracking-[0.25em] text-muted-foreground/80 select-none">
          Please wait
        </p>
      </div>
    </div>
  );
}

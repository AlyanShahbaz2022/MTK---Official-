'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

type LoaderContextType = {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
};

const LoaderContext = createContext<LoaderContextType | null>(null);

// Child component that actually handles path/search parameter updates.
// Wrapped in Suspense to avoid Next.js static compilation / prerendering errors.
function RouteListener({ stopLoading }: { stopLoading: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  return null;
}

export function RouteLoaderProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  useEffect(() => {
    let active = true;

    // 1. Intercept all internal anchor clicks
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, hashes, mailto, tel, target="_blank", downloads
      const isInternal = href.startsWith('/') || href.startsWith(window.location.origin);
      const isSpecial =
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        anchor.getAttribute('target') === '_blank' ||
        anchor.hasAttribute('download');
      
      const isHash = href.includes('#') && href.split('#')[0] === window.location.pathname;

      if (isInternal && !isSpecial && !isHash) {
        try {
          const targetUrl = new URL(href, window.location.origin);
          const currentUrl = new URL(window.location.href);

          // Only trigger loading if the destination path or query actually changes
          if (
            targetUrl.pathname !== currentUrl.pathname ||
            targetUrl.search !== currentUrl.search
          ) {
            setIsLoading(true);
          }
        } catch {
          // Fallback in case of URL parse error
        }
      }
    };

    // 2. Intercept form submissions (e.g. checkout forms, search forms)
    const handleFormSubmit = (e: SubmitEvent) => {
      const form = e.target as HTMLFormElement;
      if (form.getAttribute('target') === '_blank') return;
      
      // Verify validity to prevent showing loader when validation errors prevent submission
      if (form.checkValidity()) {
        setIsLoading(true);
      }
    };

    // 3. Intercept browser back/forward buttons
    const handlePopState = () => {
      setIsLoading(true);
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    document.addEventListener('submit', handleFormSubmit, { capture: true });
    window.addEventListener('popstate', handlePopState);

    // 4. Monkey patch window history state methods to catch programmatic next/navigation pushes
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      setTimeout(() => {
        if (active) setIsLoading(false);
      }, 0);
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      setTimeout(() => {
        if (active) setIsLoading(false);
      }, 0);
      return originalReplaceState.apply(this, args);
    };

    return () => {
      active = false;
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      document.removeEventListener('submit', handleFormSubmit, { capture: true });
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <LoaderContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      
      <Suspense fallback={null}>
        <RouteListener stopLoading={stopLoading} />
      </Suspense>
      
      {/* Luxury Loading Screen Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md px-4">
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

          <div className="flex flex-col items-center gap-6 animate-fade-in duration-300">
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
      )}
    </LoaderContext.Provider>
  );
}

export function useRouteLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useRouteLoader must be used within a RouteLoaderProvider');
  }
  return context;
}

'use client';

import { useState } from 'react';

/** Newsletter signup (frontend-only — shows confirmation, no backend wiring). */
export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <p className="text-sm tracking-wide text-light-gray/80" role="status">
        Thank you — you&apos;re on the list.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
      className="flex w-full max-w-md items-center border-b border-light-gray/30 focus-within:border-accent"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        aria-label="Email address"
        className="h-12 flex-1 bg-transparent text-sm text-light-gray placeholder:text-light-gray/40 focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 px-2 text-xs font-medium uppercase tracking-[0.2em] text-light-gray transition-colors duration-fast hover:text-accent"
      >
        Subscribe
      </button>
    </form>
  );
}

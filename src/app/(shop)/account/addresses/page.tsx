import { MapPin, Plus } from 'lucide-react';
import { requireUser } from '@/lib/session';

export default async function AddressesPage() {
  await requireUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-foreground">
            Addresses
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Saved shipping &amp; billing addresses.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 border border-primary/20 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground"
          title="Available with the account backend"
        >
          <Plus className="size-4" /> Add
        </button>
      </div>

      <div className="flex flex-col items-center gap-5 border border-dashed border-primary/20 py-20 text-center">
        <MapPin className="size-10 text-muted-foreground" strokeWidth={1} />
        <div className="space-y-1.5">
          <p className="font-display text-xl tracking-tight text-foreground">
            No saved addresses
          </p>
          <p className="text-sm text-muted-foreground">
            Your saved addresses will appear here at checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

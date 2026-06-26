import { requireUser } from '@/lib/session';

export default async function ProfilePage() {
  const user = await requireUser();

  const rows = [
    { label: 'Name', value: user.name ?? '—' },
    { label: 'Email', value: user.email ?? '—' },
    { label: 'Account type', value: user.role === 'ADMIN' ? 'Administrator' : 'Customer' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          Profile
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account information.
        </p>
      </div>

      <dl className="divide-y divide-primary/10 border-y border-primary/10">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-5">
            <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {r.label}
            </dt>
            <dd className="text-base text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>

      <p className="text-xs italic text-muted-foreground">
        Editing your profile details will be available once the account backend
        is connected.
      </p>
    </div>
  );
}

import { Truck, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

const services = [
  { icon: Truck, title: 'Complimentary Shipping', desc: 'On all orders over Rs 10,000' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Encrypted & protected' },
  { icon: Sparkles, title: 'Crafted to Last', desc: 'Considered, quality materials' },
];

export function ServiceStrip() {
  return (
    <section className="border-t border-primary/10">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-y-10 px-6 py-14 md:grid-cols-4 md:px-10">
        {services.map((s) => (
          <div key={s.title} className="flex flex-col items-center px-4 text-center">
            <s.icon className="size-6 text-accent" strokeWidth={1.5} />
            <h3 className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-foreground">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

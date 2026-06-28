import { Truck, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';

const services = [
  { icon: Truck, title: 'Complimentary Shipping', desc: 'On all orders over Rs 10,000' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Encrypted & protected' },
  { icon: Sparkles, title: 'Crafted to Last', desc: 'Considered, quality materials' },
];

export function ServiceStrip() {
  return (
    <section className="border-t border-primary/10 bg-gradient-to-b from-background to-primary/[0.03]">
      <div className="mx-auto grid max-w-screen-2xl grid-cols-2 gap-y-8 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-4 md:px-10">
        {services.map((s, i) => (
          <div
            key={s.title}
            className="group flex flex-col items-center px-3 text-center sm:px-6"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* icon with glow ring */}
            <div className="flex size-14 items-center justify-center rounded-2xl bg-accent/8 shadow-sm ring-1 ring-accent/20 transition-all duration-300 group-hover:bg-accent/15 group-hover:shadow-md group-hover:ring-accent/40">
              <s.icon className="size-6 text-accent transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
            </div>
            <h3 className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
              {s.title}
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

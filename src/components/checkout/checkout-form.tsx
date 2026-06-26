'use client';

import { useActionState, useEffect, useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Tag, Upload } from 'lucide-react';
import { placeOrder, previewCoupon, type PlaceOrderState } from '@/server/actions/checkout';
import {
  DELIVERY_METHODS,
  FREE_SHIPPING_THRESHOLD,
  computeShipping,
  type DeliveryMethodId,
} from '@/lib/checkout-pricing';
import { formatPrice } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export interface CheckoutLine {
  variantId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: { url: string; alt: string };
}

interface Prefill {
  email: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
}

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'Gilgit-Baltistan', 'AJK'];

const initial: PlaceOrderState = {};

export function CheckoutForm({
  lines,
  subtotal,
  itemCount,
  stripeEnabled,
  easypaisa,
  prefill,
}: {
  lines: CheckoutLine[];
  subtotal: number;
  itemCount: number;
  stripeEnabled: boolean;
  easypaisa: { enabled: boolean; name: string; number: string };
  prefill: Prefill;
}) {
  const [state, formAction, isPending] = useActionState(placeOrder, initial);
  const router = useRouter();
  const canceled = useSearchParams().get('canceled') === '1';

  const [delivery, setDelivery] = useState<DeliveryMethodId>('standard');
  const [payment, setPayment] = useState<'COD' | 'CARD' | 'EASYPAISA'>('COD');
  const [proofName, setProofName] = useState<string | null>(null);

  // Coupon state.
  const [couponInput, setCouponInput] = useState('');
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponPending, startCoupon] = useTransition();

  const shipping = computeShipping(delivery, subtotal);
  const discount = applied?.discount ?? 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  // Redirect on success (COD → confirmation; CARD → Stripe).
  useEffect(() => {
    if (state.orderNumber) {
      router.push(`/checkout/success?order=${state.orderNumber}`);
    } else if (state.redirectUrl) {
      window.location.assign(state.redirectUrl);
    }
  }, [state.orderNumber, state.redirectUrl, router]);

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    startCoupon(async () => {
      const res = await previewCoupon(code);
      if (res.ok && res.code) {
        setApplied({ code: res.code, discount: res.discount ?? 0 });
        setCouponError(null);
      } else {
        setApplied(null);
        setCouponError(res.error ?? 'Invalid coupon.');
      }
    });
  }

  const submitLabel = useMemo(() => {
    if (isPending) return 'Placing order…';
    return payment === 'CARD' ? 'Pay by card' : 'Place order';
  }, [isPending, payment]);

  return (
    <form action={formAction} className="grid gap-12 lg:grid-cols-[1fr_24rem]">
      {/* Hidden controlled fields */}
      <input type="hidden" name="deliveryMethod" value={delivery} />
      <input type="hidden" name="paymentMethod" value={payment} />
      <input type="hidden" name="country" value="PK" />
      <input type="hidden" name="couponCode" value={applied?.code ?? ''} />

      {/* LEFT: details */}
      <div className="space-y-12">
        {canceled && !state.error && (
          <p
            role="status"
            className="border-l-2 border-accent bg-muted/50 px-5 py-4 text-base text-foreground"
          >
            Payment canceled. Your bag is intact — try again when you&apos;re ready.
          </p>
        )}
        {state.error && (
          <p
            role="alert"
            className="border-l-2 border-red-500 bg-red-50 px-5 py-4 text-base text-red-700"
          >
            {state.error}
          </p>
        )}

        <Section index="01" title="Contact">
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={prefill.email}
              required
            />
          </Field>
        </Section>

        <Section index="02" title="Shipping address">
          <Field label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              name="fullName"
              autoComplete="name"
              defaultValue={prefill.fullName}
              required
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={prefill.phone}
              required
            />
          </Field>
          <Field label="Address" htmlFor="line1" full>
            <Input
              id="line1"
              name="line1"
              autoComplete="address-line1"
              placeholder="House / street"
              defaultValue={prefill.line1}
              required
            />
          </Field>
          <Field label="Apartment, suite (optional)" htmlFor="line2" full>
            <Input
              id="line2"
              name="line2"
              autoComplete="address-line2"
              defaultValue={prefill.line2}
            />
          </Field>
          <Field label="City" htmlFor="city">
            <Input
              id="city"
              name="city"
              autoComplete="address-level2"
              defaultValue={prefill.city}
              required
            />
          </Field>
          <Field label="Province" htmlFor="state">
            <select
              id="state"
              name="state"
              defaultValue={prefill.state || ''}
              className="h-12 w-full rounded-none border-0 border-b border-primary/20 bg-transparent px-1 text-base text-foreground transition-colors hover:border-primary/40 focus-visible:border-accent focus-visible:outline-none"
            >
              <option value="">Select province</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Postal code (optional)" htmlFor="postalCode">
            <Input
              id="postalCode"
              name="postalCode"
              autoComplete="postal-code"
              defaultValue={prefill.postalCode}
            />
          </Field>
        </Section>

        <Section index="03" title="Delivery">
          <div className="col-span-full space-y-3">
            {(Object.keys(DELIVERY_METHODS) as DeliveryMethodId[]).map((id) => {
              const m = DELIVERY_METHODS[id];
              const cost = freeShipping ? 0 : m.cost;
              return (
                <Choice
                  key={id}
                  selected={delivery === id}
                  onClick={() => setDelivery(id)}
                  title={m.label}
                  note={m.note}
                  right={cost === 0 ? 'Free' : formatPrice(cost)}
                />
              );
            })}
          </div>
        </Section>

        <Section index="04" title="Payment">
          <div className="col-span-full space-y-3">
            <Choice
              selected={payment === 'COD'}
              onClick={() => setPayment('COD')}
              title="Cash on Delivery"
              note="Pay with cash when your order arrives"
            />
            {easypaisa.enabled && (
              <Choice
                selected={payment === 'EASYPAISA'}
                onClick={() => setPayment('EASYPAISA')}
                title="EasyPaisa"
                note="Transfer the total, then upload your receipt"
              />
            )}
            {stripeEnabled && (
              <Choice
                selected={payment === 'CARD'}
                onClick={() => setPayment('CARD')}
                title="Credit / Debit card"
                note="Secure payment via Stripe"
              />
            )}

            {/* EasyPaisa instructions + screenshot upload */}
            {payment === 'EASYPAISA' && (
              <div className="space-y-5 border border-accent/40 bg-accent/5 p-5">
                <div className="space-y-3 text-base">
                  <p className="font-medium text-foreground">
                    Send {formatPrice(total)} to this EasyPaisa account:
                  </p>
                  <div className="space-y-1 border-l-2 border-accent pl-4">
                    <p className="text-foreground">
                      <span className="text-muted-foreground">Account name:</span>{' '}
                      <span className="font-medium">{easypaisa.name}</span>
                    </p>
                    <p className="text-foreground">
                      <span className="text-muted-foreground">Account number:</span>{' '}
                      <span className="font-medium tracking-wide">
                        {easypaisa.number}
                      </span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    After transferring, upload a screenshot of the transaction. We&apos;ll
                    verify it and confirm your order by email — usually within a few hours.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentProof" className="text-[13px] tracking-[0.15em]">
                    Transaction screenshot
                  </Label>
                  <label
                    htmlFor="paymentProof"
                    className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-primary/30 bg-background px-4 py-5 text-base text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    <Upload className="size-5" />
                    {proofName ?? 'Choose screenshot (JPG / PNG, max 5 MB)'}
                  </label>
                  <input
                    id="paymentProof"
                    name="paymentProof"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => setProofName(e.target.files?.[0]?.name ?? null)}
                  />
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* RIGHT: summary */}
      <aside className="h-fit space-y-7 border border-primary/10 bg-muted/30 p-7 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl tracking-tight text-foreground">
          Order summary
        </h2>

        <ul className="space-y-4 border-b border-primary/10 pb-6">
          {lines.map((l) => (
            <li key={l.variantId} className="flex gap-4">
              <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
                {l.image && (
                  <Image
                    src={l.image.url}
                    alt={l.image.alt}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {l.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-foreground">{l.name}</p>
                <p className="text-sm text-muted-foreground">
                  {l.size} · {l.color}
                </p>
              </div>
              <span className="text-base text-foreground">{formatPrice(l.lineTotal)}</span>
            </li>
          ))}
        </ul>

        {/* Coupon */}
        <div className="space-y-2 border-b border-primary/10 pb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="pointer-events-none absolute left-1 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder="Coupon code"
                className="pl-7 uppercase"
                disabled={!!applied}
              />
            </div>
            {applied ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setApplied(null);
                  setCouponInput('');
                  setCouponError(null);
                }}
              >
                Remove
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyCoupon}
                disabled={couponPending}
              >
                {couponPending ? <Loader2 className="size-4 animate-spin" /> : 'Apply'}
              </Button>
            )}
          </div>
          {couponError && <p className="text-sm text-red-600">{couponError}</p>}
          {applied && (
            <p className="flex items-center gap-1.5 text-sm text-green-700">
              <Check className="size-4" /> {applied.code} applied
            </p>
          )}
        </div>

        {/* Totals */}
        <div className="space-y-3 border-b border-primary/10 pb-6 text-base">
          <Row label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}>
            {formatPrice(subtotal)}
          </Row>
          <Row label="Shipping">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </Row>
          {discount > 0 && (
            <Row label="Discount" accent>
              −{formatPrice(discount)}
            </Row>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-foreground">Total</span>
          <span className="font-display text-3xl text-foreground">{formatPrice(total)}</span>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isPending}>
          {submitLabel}
        </Button>
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Secure · encrypted checkout
        </p>
      </aside>
    </form>
  );
}

/* ---------- building blocks ---------- */

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-6 flex items-baseline gap-3">
        <span className="font-display text-base text-accent">{index}</span>
        <h2 className="font-display text-2xl tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2.5 ${full ? 'sm:col-span-2' : ''}`}>
      <Label htmlFor={htmlFor} className="text-[13px] tracking-[0.15em]">
        {label}
      </Label>
      {children}
    </div>
  );
}

function Choice({
  selected,
  onClick,
  title,
  note,
  right,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  note: string;
  right?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 border p-5 text-left transition-colors ${
        selected
          ? 'border-accent bg-accent/5'
          : 'border-primary/15 hover:border-primary/35'
      }`}
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
          selected ? 'border-accent' : 'border-primary/30'
        }`}
      >
        {selected && <span className="size-3 rounded-full bg-accent" />}
      </span>
      <span className="flex-1">
        <span className="block text-base font-medium text-foreground">{title}</span>
        <span className="block text-sm text-muted-foreground">{note}</span>
      </span>
      {right && <span className="text-base text-foreground">{right}</span>}
    </button>
  );
}

function Row({
  label,
  accent,
  children,
}: {
  label: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? 'text-green-700' : 'text-foreground'}>{children}</span>
    </div>
  );
}

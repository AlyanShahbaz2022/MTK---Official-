'use client';

import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, X, ExternalLink, Loader2 } from 'lucide-react';
import {
  acceptPayment,
  rejectPayment,
  type ReviewState,
} from '@/server/actions/admin-payments';
import { toast } from '@/store/admin-toast';

export interface PendingPayment {
  id: string;
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  total: string; // formatted
  createdAt: string; // formatted
  proofUrl: string;
  items: { id: string; productName: string; quantity: number }[];
}

const initial: ReviewState = {};

export function PaymentReviewCard({ payment }: { payment: PendingPayment }) {
  const [acceptState, acceptAction, accepting] = useActionState(acceptPayment, initial);
  const [rejectState, rejectAction, rejecting] = useActionState(rejectPayment, initial);
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    if (acceptState.success) toast.success(acceptState.success);
    if (acceptState.error) toast.error(acceptState.error);
  }, [acceptState]);

  useEffect(() => {
    if (rejectState.success) toast.success(rejectState.success);
    if (rejectState.error) toast.error(rejectState.error);
  }, [rejectState]);

  return (
    <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        {/* Screenshot */}
        <a
          href={payment.proofUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block h-[220px] overflow-hidden rounded-t-[14px] bg-slate-100 md:rounded-l-[14px] md:rounded-tr-none"
        >
          <Image
            src={payment.proofUrl}
            alt={`Payment proof for ${payment.orderNumber}`}
            fill
            sizes="220px"
            className="object-cover"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-slate-900/0 text-white opacity-0 transition group-hover:bg-slate-900/40 group-hover:opacity-100">
            <ExternalLink className="size-6" />
          </span>
        </a>

        {/* Details */}
        <div className="p-[20px]">
          <div className="flex flex-wrap items-start justify-between gap-[12px]">
            <div>
              <p className="text-[16px] font-semibold text-slate-900">
                {payment.orderNumber}
              </p>
              <p className="text-[13px] text-slate-500">{payment.createdAt}</p>
            </div>
            <span className="rounded-full bg-amber-50 px-[10px] py-[3px] text-[12px] font-medium text-amber-600 ring-1 ring-inset ring-amber-200">
              Awaiting verification
            </span>
          </div>

          <div className="mt-[14px] grid gap-[6px] text-[14px] text-slate-600 sm:grid-cols-2">
            <p>
              <span className="text-slate-400">Customer:</span> {payment.fullName}
            </p>
            <p>
              <span className="text-slate-400">Amount:</span>{' '}
              <span className="font-semibold text-slate-900">{payment.total}</span>
            </p>
            <p className="truncate">
              <span className="text-slate-400">Email:</span> {payment.email}
            </p>
            <p>
              <span className="text-slate-400">Phone:</span> {payment.phone}
            </p>
          </div>

          <p className="mt-[12px] text-[13px] text-slate-500">
            {payment.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
          </p>

          {/* Actions */}
          {!showReject ? (
            <div className="mt-[18px] flex flex-wrap gap-[10px]">
              <form action={acceptAction}>
                <input type="hidden" name="orderId" value={payment.id} />
                <button
                  type="submit"
                  disabled={accepting || rejecting}
                  className="inline-flex items-center gap-[6px] rounded-[10px] bg-emerald-600 px-[16px] py-[9px] text-[14px] font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {accepting ? (
                    <Loader2 className="size-[16px] animate-spin" />
                  ) : (
                    <Check className="size-[16px]" />
                  )}
                  Accept &amp; confirm
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowReject(true)}
                disabled={accepting || rejecting}
                className="inline-flex items-center gap-[6px] rounded-[10px] border border-red-200 px-[16px] py-[9px] text-[14px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                <X className="size-[16px]" />
                Reject
              </button>
            </div>
          ) : (
            <form action={rejectAction} className="mt-[18px] space-y-[10px]">
              <input type="hidden" name="orderId" value={payment.id} />
              <input
                name="reason"
                placeholder="Reason (optional, shown to customer)"
                className="h-[42px] w-full rounded-[10px] border border-slate-200 bg-slate-50 px-[14px] text-[14px] text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none"
              />
              <div className="flex gap-[10px]">
                <button
                  type="submit"
                  disabled={rejecting}
                  className="inline-flex items-center gap-[6px] rounded-[10px] bg-red-600 px-[16px] py-[9px] text-[14px] font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {rejecting ? (
                    <Loader2 className="size-[16px] animate-spin" />
                  ) : (
                    <X className="size-[16px]" />
                  )}
                  Confirm reject &amp; restock
                </button>
                <button
                  type="button"
                  onClick={() => setShowReject(false)}
                  className="rounded-[10px] px-[16px] py-[9px] text-[14px] font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

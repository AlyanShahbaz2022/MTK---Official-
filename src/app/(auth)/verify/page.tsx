import type { Metadata } from 'next';
import { VerifyForm } from '@/components/auth/verify-form';

export const metadata: Metadata = { title: 'Verify your email' };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <VerifyForm email={(email ?? '').toLowerCase()} />;
}

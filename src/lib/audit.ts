import type { AuditAction, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Append-only security audit log (spec project.md §6.13).
 * Failures are swallowed so logging never blocks the primary flow.
 */
export async function logAudit(entry: {
  action: AuditAction;
  userId?: string | null;
  email?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  meta?: Prisma.InputJsonValue;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        userId: entry.userId ?? null,
        email: entry.email ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        meta: entry.meta,
      },
    });
  } catch (err) {
    console.error('[audit] failed to write audit log', err);
  }
}

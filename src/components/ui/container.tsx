import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Responsive page container — the single source of truth for horizontal
 * gutters and max content width. Fluid padding grows with the viewport:
 *   phone  → px-4   (16px)
 *   xs/sm  → px-6   (24px)
 *   lg     → px-8   (32px)
 *
 * Use this instead of ad-hoc `mx-auto max-w-… px-…` so gutters stay consistent
 * across the whole site (Phase 0 foundation).
 */
const SIZES = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-none',
} as const;

export type ContainerSize = keyof typeof SIZES;

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
  /** Render without horizontal padding (e.g. when a child manages its own). */
  bleed?: boolean;
  as?: React.ElementType;
}

export function Container({
  size = 'xl',
  bleed = false,
  as: Tag = 'div',
  className,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full',
        SIZES[size],
        !bleed && 'px-4 sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Vertical section rhythm — consistent top/bottom spacing that tightens on
 * phones and opens up on desktop.
 */
const SECTION_SPACING = {
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16 lg:py-20',
  lg: 'py-16 sm:py-24 lg:py-32',
} as const;

export type SectionSpacing = keyof typeof SECTION_SPACING;

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing;
}

export function Section({
  spacing = 'md',
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn(SECTION_SPACING[spacing], className)} {...props} />
  );
}

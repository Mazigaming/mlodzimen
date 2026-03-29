'use client';

import { useLenis } from '@/lib/useLenis';

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  useLenis();

  return <>{children}</>;
}

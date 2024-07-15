'use client';

import { AppShell } from '@mantine/core';
import { PropsWithChildren } from 'react';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <AppShell>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

import '@/app/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mdxeditor/editor/style.css';

import { dataProvider } from '@/providers/data-provider';
import { useNotificationProvider } from '@/providers/notification-provider';
import theme from '@/theme';
import { Resource } from '@/types';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Refine } from '@refinedev/core';
import routerProvider from '@refinedev/nextjs-router';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Onelook | Pentesting Report Automation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MantineProvider theme={theme}>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider}
            // authProvider={authProvider}
            notificationProvider={useNotificationProvider}
            // accessControlProvider={accessControlProvider}
            resources={[
              {
                name: 'analysis-results' satisfies Resource,
                list: '/results/:id',
                meta: {
                  label: 'Results',
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              useNewQueryKeys: true,
            }}
          >
            <Notifications />
            <ModalsProvider>{children}</ModalsProvider>
          </Refine>
        </MantineProvider>
      </body>
    </html>
  );
}

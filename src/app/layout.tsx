import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import MainLayout from '@/components/layout/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { AppInitializer } from '@/components/app-initializer';

export const metadata: Metadata = {
  title: 'Ibom PowerHub | Akwa Ibom State',
  description: 'The Digital Super-App & Civic Utility Gateway for Akwa Ibom State — Power, FloodSense, 31 LGAs, ARISE Agenda, and Transit.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ibom PowerHub'
  },
  icons: {
    icon: '/icon-192.png',
    shortcut: '/icon-192.png',
    apple: '/apple-icon.png',
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d5c2e' },
    { media: '(prefers-color-scheme: dark)', color: '#0a2e14' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <AppInitializer />
            <MainLayout>{children}</MainLayout>
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

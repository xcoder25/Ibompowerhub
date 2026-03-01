
import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import MainLayout from '@/components/layout/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { AppInitializer } from '@/components/app-initializer';

export const metadata: Metadata = {
  title: 'Arise AKS',
  description: 'Your digital gateway to Akwa Ibom State services — ARISE Agenda powered.',
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

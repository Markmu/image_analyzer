import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SessionProvider } from '@/providers/SessionProvider';
import { Header } from '@/components/shared/Header';
import DynamicBackground from '@/components/shared/DynamicBackground';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Image Analyzer - AI Powered Image Analysis',
  description: 'Upload and analyze images with AI powered style detection and generation',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <DynamicBackground />
          <Header />
          <main id="main-content" className="min-h-screen" tabIndex={-1}>
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}

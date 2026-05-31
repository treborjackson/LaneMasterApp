import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Nunito } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets:  ['latin'],
  display:  'swap',
});

const nunito = Nunito({
  variable: '--font-body',
  subsets:  ['latin'],
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'Lane Master',
  description: 'AI-powered bowling coaching app',
  manifest:    '/manifest.json',
};

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
  themeColor:          '#1c1006',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <body>{children}</body>
    </html>
  );
}

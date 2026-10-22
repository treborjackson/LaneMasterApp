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
  title:           'Lane Master',
  description:     'AI-powered bowling coaching app',
  manifest:        '/manifest.json',
  appleWebApp: {
    capable:          true,
    statusBarStyle:   'black-translucent',
    title:            'Lane Master',
  },
  icons: {
    apple: '/apple-touch-icon.png',
    icon:  [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width:               'device-width',
  initialScale:        1,
  maximumScale:        1,
  userScalable:        false,
  themeColor:          '#1a0e02',
  viewportFit:         'cover',
  colorScheme:         'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${nunito.variable}`}>
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js');
            });
          }
        `}} />
      </body>
    </html>
  );
}

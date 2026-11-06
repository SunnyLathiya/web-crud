import { Fraunces, Source_Sans_3 } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const displayFont = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata = {
  title: {
    default: 'WebChat',
    template: '%s · WebChat',
  },
  description: 'Real-time chat for direct messages and groups.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} ${bodyFont.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

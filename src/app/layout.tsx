import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MTK — Modern Clothing for Men, Women & Kids',
    template: '%s | MTK',
  },
  description:
    'MTK is a modern clothing brand offering curated fashion for men, women, and kids.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

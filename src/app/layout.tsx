import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScribeCrop | Precision Image Word Extractor',
  description: 'A professional internal tool for scribing and harvesting high-precision text regions from images.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

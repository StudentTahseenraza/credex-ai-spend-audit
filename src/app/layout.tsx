import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Spend Audit - Find Savings in Your AI Tool Stack',
  description: 'Analyze your AI tool spending. Get personalized recommendations to save 20-40% on ChatGPT, Cursor, Claude, and more.',
  keywords: 'AI spend, cost optimization, ChatGPT savings, Cursor discount, AI audit',
  authors: [{ name: 'Credex' }],
  openGraph: {
    title: 'AI Spend Audit - Find Savings in Your AI Stack',
    description: 'Analyze your AI spending and discover hidden savings. Free audit tool.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
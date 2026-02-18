import type { Metadata } from 'next';
import './globals.css';
import { ClientLayout } from './ClientLayout';

export const metadata: Metadata = {
  title: 'DecodeQuest',
  description: 'Build your decoding skills through quick game missions',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-size-medium spacing-wide line-relaxed">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

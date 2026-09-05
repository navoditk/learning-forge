import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Learning Forge',
  description: 'Learning Forge development foundation',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

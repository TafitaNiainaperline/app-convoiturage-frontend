import type { Metadata } from 'next';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Covoiturage Madagascar',
  description: 'Application de covoiturage local - Madagascar',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

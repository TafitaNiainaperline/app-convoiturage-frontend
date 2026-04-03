import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import './globals.scss';

export const metadata: Metadata = {
  title: 'Covoiturage Madagascar',
  description: 'Application de covoiturage local - Madagascar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const { user, deconnecter } = useAuth();
  const router = useRouter();

  const handleDeconnexion = () => {
    deconnecter();
    router.push('/login');
  };

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>🚗 Covoiturage Mada</Link>

      <div className={styles.liens}>
        {user ? (
          <>
            <Link href="/">Trajets</Link>
            <Link href="/publier">Publier</Link>
            <Link href="/reservations">Mes réservations</Link>
            <Link href="/profil">Profil</Link>
            <button onClick={handleDeconnexion} className={styles.btnDeconnexion}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Se connecter</Link>
            <Link href="/register" className={styles.btnInscription}>S'inscrire</Link>
          </>
        )}
      </div>
    </nav>
  );
}

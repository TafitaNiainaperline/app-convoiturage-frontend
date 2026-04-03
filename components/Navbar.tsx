'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Car, Plus, BookOpen, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './Navbar.module.scss';

export default function Navbar() {
  const { user, deconnecter } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleDeconnexion = () => {
    deconnecter();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;
  const peutPublier = user?.role === 'conducteur' || user?.role === 'les_deux';

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>
        <Car size={22} />
        <span>Covoiturage Mada</span>
      </Link>

      <div className={styles.liens}>
        {user ? (
          <>
            <Link href="/" className={`${styles.lien} ${isActive('/') ? styles.actif : ''}`}>
              <Car size={16} />
              Trajets
            </Link>
            {peutPublier && (
              <Link href="/publier" className={`${styles.lien} ${isActive('/publier') ? styles.actif : ''}`}>
                <Plus size={16} />
                Publier
              </Link>
            )}
            <Link href="/reservations" className={`${styles.lien} ${isActive('/reservations') ? styles.actif : ''}`}>
              <BookOpen size={16} />
              Réservations
            </Link>
            <Link href="/profil" className={`${styles.lien} ${isActive('/profil') ? styles.actif : ''}`}>
              <User size={16} />
              Profil
            </Link>
            <button onClick={handleDeconnexion} className={styles.btnDeconnexion}>
              <LogOut size={15} />
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={styles.lien}>
              <LogIn size={16} />
              Se connecter
            </Link>
            <Link href="/register" className={styles.btnInscription}>
              <UserPlus size={16} />
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

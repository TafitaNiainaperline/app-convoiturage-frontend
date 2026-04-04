'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Car, Plus, BookOpen, LogIn, UserPlus, LayoutList, User, LogOut, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getNotifications } from '@/lib/api';
import styles from './Navbar.module.scss';

const ROLE_LABEL: Record<string, string> = {
  passager:   'Passager',
  conducteur: 'Conducteur',
  les_deux:   'Passager & Conducteur',
};

export default function Navbar() {
  const { user, deconnecter } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [nbNonLues, setNbNonLues] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const peutPublier = user?.role === 'conducteur';
  const isActive = (path: string) => pathname === path;

  // Fermer le menu si clic en dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOuvert(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fermer le menu à chaque changement de page
  useEffect(() => { setMenuOuvert(false); }, [pathname]);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    if (!user) return;
    const charger = () => {
      getNotifications()
        .then(data => setNbNonLues(data.filter(n => !n.lu).length))
        .catch(() => {});
    };
    charger();
    const interval = setInterval(charger, 30000);
    return () => clearInterval(interval);
  }, [user, pathname]);

  const handleDeconnexion = () => {
    setMenuOuvert(false);
    deconnecter();
    router.push('/login');
  };

  if (pathname === '/login' || pathname === '/register') return null;

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
              <Car size={16} /> Trajets
            </Link>

            {peutPublier && (
              <>
                <Link href="/conducteur" className={`${styles.lien} ${isActive('/conducteur') ? styles.actif : ''}`}>
                  <LayoutList size={16} /> Mes trajets
                </Link>
                <Link href="/publier" className={`${styles.lien} ${isActive('/publier') ? styles.actif : ''}`}>
                  <Plus size={16} /> Publier
                </Link>
              </>
            )}

            {user.role === 'passager' && (
              <Link href="/reservations" className={`${styles.lien} ${isActive('/reservations') ? styles.actif : ''}`}>
                <BookOpen size={16} /> Réservations
              </Link>
            )}

            {/* Cloche notifications */}
            <Link href="/notifications" className={`${styles.cloche} ${isActive('/notifications') ? styles.actif : ''}`}>
              <Bell size={18} />
              {nbNonLues > 0 && (
                <span className={styles.badge}>{nbNonLues > 9 ? '9+' : nbNonLues}</span>
              )}
            </Link>

            {/* Avatar + menu déroulant */}
            <div className={styles.avatarWrapper} ref={menuRef}>
              <button
                className={`${styles.avatarBtn} ${menuOuvert ? styles.avatarBtnActif : ''}`}
                onClick={() => setMenuOuvert(v => !v)}
              >
                <div className={styles.avatarInitiales}>
                  {user.prenom?.[0]}{user.nom?.[0]}
                </div>
                <ChevronDown size={14} className={`${styles.chevron} ${menuOuvert ? styles.chevronOuvert : ''}`} />
              </button>

              {menuOuvert && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownAvatar}>
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </div>
                    <div>
                      <div className={styles.dropdownNom}>{user.prenom} {user.nom}</div>
                      <div className={styles.dropdownRole}>{user.role ? ROLE_LABEL[user.role] : ''}</div>
                    </div>
                  </div>

                  <div className={styles.dropdownDivider} />

                  <Link href="/profil" className={styles.dropdownItem}>
                    <User size={15} /> Mon profil
                  </Link>

                  <div className={styles.dropdownDivider} />

                  <button className={styles.dropdownItemDanger} onClick={handleDeconnexion}>
                    <LogOut size={15} /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {pathname !== '/login' && (
              <Link href="/login" className={styles.lien}>
                <LogIn size={16} /> Se connecter
              </Link>
            )}
            {pathname !== '/register' && (
              <Link href="/register" className={styles.btnInscription}>
                <UserPlus size={16} /> S'inscrire
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Car, Plus, BookOpen, LayoutList, User, LogOut, ChevronDown, Bell } from 'lucide-react';
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

  const peutPublier = user?.role === 'conducteur' || user?.role === 'les_deux';
  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOuvert(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMenuOuvert(false); }, [pathname]);

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
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <span className={styles.logoIcon}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* MapPin */}
            <path
              d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6z"
              fill="rgba(255,255,255,0.2)"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            {/* Mini voiture inside the pin */}
            <path
              d="M9.5 8.8 L10.1 7.4 L13.9 7.4 L14.5 8.8 Z"
              fill="white"
            />
            <rect x="9.2" y="8.8" width="5.6" height="2.4" rx="0.6" fill="white" />
            <circle cx="10.4" cy="11.4" r="0.7" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="0.5" />
            <circle cx="13.6" cy="11.4" r="0.7" fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="0.5" />
          </svg>
        </span>
      </Link>

      <div className={styles.liens}>
        {user ? (
          <>
            <Link href="/" className={`${styles.lien} ${isActive('/') ? styles.actif : ''}`}>
              <Car size={15} /> Trajets
            </Link>

            {peutPublier && (
              <>
                <Link href="/conducteur" className={`${styles.lien} ${isActive('/conducteur') ? styles.actif : ''}`}>
                  <LayoutList size={15} /> Mes trajets
                </Link>
                <Link href="/publier" className={`${styles.lienPublier} ${isActive('/publier') ? styles.actif : ''}`}>
                  <Plus size={15} /> Publier
                </Link>
              </>
            )}

            {(user.role === 'passager' || user.role === 'les_deux') && (
              <Link href="/reservations" className={`${styles.lien} ${isActive('/reservations') ? styles.actif : ''}`}>
                <BookOpen size={15} /> Réservations
              </Link>
            )}

            <span className={styles.divider} />

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
                <ChevronDown size={13} className={`${styles.chevron} ${menuOuvert ? styles.chevronOuvert : ''}`} />
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
          <Link href="/login" className={styles.btnInscription}>
            <User size={15} /> Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}

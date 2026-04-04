'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import { getNotifications, marquerNotifLue, toutMarquerLu } from '@/lib/api';
import { Notification } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './notifications.module.scss';

const TYPE_CONFIG = {
  reservation_confirmee: { icone: CheckCircle, couleur: '#1E6B3C', bg: '#f0fdf4' },
  reservation_refusee:   { icone: XCircle,     couleur: '#ef4444', bg: '#fef2f2' },
  reservation_annulee:   { icone: XCircle,      couleur: '#f59e0b', bg: '#fffbeb' },
  nouvelle_reservation:  { icone: Info,          couleur: '#3b82f6', bg: '#eff6ff' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    charger();
  }, [user]);

  const handleMarquerLue = async (id: string) => {
    await marquerNotifLue(id);
    setNotifications(ns => ns.map(n => n._id === id ? { ...n, lu: true } : n));
  };

  const handleToutLire = async () => {
    await toutMarquerLu();
    setNotifications(ns => ns.map(n => ({ ...n, lu: true })));
  };

  const nonLues = notifications.filter(n => !n.lu).length;

  if (chargement) return (
    <div className={styles.spinner}><div className={styles.spinnerInner} /></div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Notifications</h1>
          <p className={styles.sousTitre}>{nonLues} non lue{nonLues !== 1 ? 's' : ''}</p>
        </div>
        {nonLues > 0 && (
          <button className={styles.btnToutLire} onClick={handleToutLire}>
            <CheckCheck size={15} /> Tout marquer lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className={styles.vide}>
          <Bell size={48} strokeWidth={1.5} />
          <p>Aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className={styles.liste}>
          {notifications.map(n => {
            const config = TYPE_CONFIG[n.type];
            const Icone = config.icone;
            return (
              <div
                key={n._id}
                className={`${styles.carte} ${!n.lu ? styles.nonLue : ''}`}
                onClick={() => !n.lu && handleMarquerLue(n._id)}
              >
                <div className={styles.iconeWrapper} style={{ background: config.bg }}>
                  <Icone size={18} color={config.couleur} />
                </div>
                <div className={styles.contenu}>
                  <p className={styles.message}>{n.message}</p>
                  <span className={styles.date}>
                    <Clock size={12} />
                    {new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {!n.lu && <div className={styles.pointNonLu} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

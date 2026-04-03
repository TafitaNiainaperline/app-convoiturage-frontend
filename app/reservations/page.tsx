'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mesReservations, annulerReservation } from '@/lib/api';
import { Reservation, StatutReservation } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './reservations.module.scss';

const STATUT_COULEUR: Record<StatutReservation, string> = {
  en_attente: '#FFA500',
  confirme: '#1E6B3C',
  refuse: '#e74c3c',
  annule: '#999',
  termine: '#666',
};

const STATUT_LABEL: Record<StatutReservation, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  refuse: 'Refusé',
  annule: 'Annulé',
  termine: 'Terminé',
};

export default function ReservationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [chargement, setChargement] = useState(true);

  if (!user) { router.push('/login'); return null; }

  const charger = async () => {
    try {
      const data = await mesReservations();
      setReservations(data);
    } catch {
      setReservations([]);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleAnnuler = async (id: string) => {
    if (!confirm("Confirmer l'annulation ?")) return;
    await annulerReservation(id);
    charger();
  };

  return (
    <div>
      <h1 className={styles.titre}>Mes réservations</h1>

      {chargement ? (
        <p className={styles.vide}>Chargement...</p>
      ) : reservations.length === 0 ? (
        <p className={styles.vide}>Aucune réservation.</p>
      ) : (
        <div className={styles.liste}>
          {reservations.map(r => (
            <div key={r._id} className={styles.carte}>
              <div className={styles.carteHeader}>
                <span className={styles.villes}>
                  {r.trajet?.depart.ville} → {r.trajet?.arrivee.ville}
                </span>
                <span className={styles.badge} style={{ backgroundColor: STATUT_COULEUR[r.statut] }}>
                  {STATUT_LABEL[r.statut]}
                </span>
              </div>
              <p className={styles.info}>📅 {r.trajet && new Date(r.trajet.dateDepart).toLocaleDateString('fr-FR')} à {r.trajet?.heureDepart}</p>
              <p className={styles.info}>💺 {r.nbPlaces} place(s) · 💵 {r.prixTotal.toLocaleString()} Ar</p>
              <p className={styles.info}>💳 {r.modePaiement === 'especes' ? 'Espèces' : r.modePaiement === 'mvola' ? 'MVola' : 'Orange Money'}</p>
              {r.statut === 'en_attente' && (
                <button className={styles.btnAnnuler} onClick={() => handleAnnuler(r._id)}>
                  Annuler
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

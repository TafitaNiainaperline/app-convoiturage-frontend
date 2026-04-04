'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, Users, Banknote, CreditCard, XCircle, BookOpen } from 'lucide-react';
import { mesReservations, annulerReservation } from '@/lib/api';
import { Reservation, StatutReservation } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './reservations.module.scss';

const STATUT: Record<StatutReservation, { label: string; couleur: string }> = {
  en_attente: { label: 'En attente',  couleur: '#f59e0b' },
  confirme:   { label: 'Confirmé',    couleur: '#1E6B3C' },
  refuse:     { label: 'Refusé',      couleur: '#ef4444' },
  annule:     { label: 'Annulé',      couleur: '#9ca3af' },
  termine:    { label: 'Terminé',     couleur: '#6b7280' },
};

const MODE_PAIEMENT: Record<string, string> = {
  especes:      'Espèces',
  mvola:        'MVola',
  orange_money: 'Orange Money',
};

const FILTRES = [
  { val: 'tous',       label: 'Tous' },
  { val: 'en_attente', label: 'En attente' },
  { val: 'confirme',   label: 'Confirmés' },
  { val: 'termine',    label: 'Historique' },
  { val: 'annule',     label: 'Annulés' },
];

export default function ReservationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtre, setFiltre] = useState('tous');

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

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    charger();
  }, [user]);

  const handleAnnuler = async (id: string) => {
    if (!confirm("Confirmer l'annulation ?")) return;
    await annulerReservation(id);
    charger();
  };

  const filtrees = filtre === 'tous'
    ? reservations
    : reservations.filter(r => r.statut === filtre);

  if (chargement) return (
    <div className={styles.spinner}><div className={styles.spinnerInner} /></div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.entete}>
        <h1 className={styles.titre}>Mes réservations</h1>
        <p className={styles.sousTitre}>{reservations.length} réservation{reservations.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filtres */}
      <div className={styles.filtres}>
        {FILTRES.map(f => (
          <button
            key={f.val}
            className={`${styles.filtreBtn} ${filtre === f.val ? styles.filtreBtnActif : ''}`}
            onClick={() => setFiltre(f.val)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtrees.length === 0 ? (
        <div className={styles.vide}>
          <BookOpen size={48} strokeWidth={1.5} />
          <p>{filtre === 'tous' ? "Vous n'avez pas encore de réservation." : 'Aucune réservation dans cette catégorie.'}</p>
          {filtre === 'tous' && <Link href="/" className={styles.lienParcourir}>Parcourir les trajets</Link>}
        </div>
      ) : (
        <div className={styles.liste}>
          {filtrees.map(r => {
            const st = STATUT[r.statut];
            return (
              <div key={r._id} className={styles.carte}>
                <div className={styles.carteHeader}>
                  <div className={styles.route}>
                    <span className={styles.ville}>{r.trajet?.depart.ville}</span>
                    <span className={styles.fleche}>→</span>
                    <span className={styles.ville}>{r.trajet?.arrivee.ville}</span>
                  </div>
                  <span className={styles.badge} style={{ backgroundColor: st.couleur }}>
                    {st.label}
                  </span>
                </div>

                <div className={styles.metaGrid}>
                  <span className={styles.meta}>
                    <Calendar size={13} />
                    {r.trajet && new Date(r.trajet.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className={styles.meta}>
                    <Clock size={13} />
                    {r.trajet?.heureDepart}
                  </span>
                  <span className={styles.meta}>
                    <Users size={13} />
                    {r.nbPlaces} place{r.nbPlaces > 1 ? 's' : ''}
                  </span>
                  <span className={styles.meta}>
                    <Banknote size={13} />
                    {r.prixTotal.toLocaleString()} Ar
                  </span>
                  <span className={styles.meta}>
                    <CreditCard size={13} />
                    {MODE_PAIEMENT[r.modePaiement]}
                  </span>
                </div>

                {r.statut === 'en_attente' && (
                  <button className={styles.btnAnnuler} onClick={() => handleAnnuler(r._id)}>
                    <XCircle size={14} /> Annuler la réservation
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getTrajet, reserverTrajet } from '@/lib/api';
import { Trajet, ModePaiement } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './trajet.module.scss';

const PAIEMENTS: { val: ModePaiement; label: string }[] = [
  { val: 'especes', label: 'Espèces' },
  { val: 'mvola', label: 'MVola' },
  { val: 'orange_money', label: 'Orange Money' },
];

export default function DetailTrajetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [chargement, setChargement] = useState(true);
  const [nbPlaces, setNbPlaces] = useState(1);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('especes');
  const [reservant, setReservant] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getTrajet(id)
      .then(setTrajet)
      .catch(() => router.push('/'))
      .finally(() => setChargement(false));
  }, [id]);

  const handleReserver = async () => {
    if (!user) return router.push('/login');
    setReservant(true);
    try {
      await reserverTrajet({ trajetId: id, nbPlaces, modePaiement });
      setMessage('Réservation envoyée ! Attendez la confirmation du conducteur.');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setReservant(false);
    }
  };

  if (chargement) return <p className={styles.chargement}>Chargement...</p>;
  if (!trajet) return null;

  const placesRestantes = trajet.placesDisponibles - trajet.placesReservees;
  const estConducteur = trajet.conducteur?.id === user?.id || trajet.conducteur?._id === user?.id;

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.retour}>← Retour</button>

      <div className={styles.header}>
        <h1>{trajet.depart.ville} → {trajet.arrivee.ville}</h1>
        <span className={styles.prix}>{trajet.prixParPlace.toLocaleString()} Ar / place</span>
      </div>

      <div className={styles.section}>
        <div className={styles.infos}>
          <div className={styles.info}><span>📅 Date</span><strong>{new Date(trajet.dateDepart).toLocaleDateString('fr-FR')}</strong></div>
          <div className={styles.info}><span>🕐 Heure</span><strong>{trajet.heureDepart}</strong></div>
          <div className={styles.info}><span>💺 Places restantes</span><strong>{placesRestantes}</strong></div>
          <div className={styles.info}><span>💰 Prix/place</span><strong>{trajet.prixParPlace.toLocaleString()} Ar</strong></div>
        </div>
        {trajet.description && <p className={styles.description}>{trajet.description}</p>}
      </div>

      {trajet.conducteur && (
        <div className={styles.section}>
          <h2>Conducteur</h2>
          <p className={styles.conducteurNom}>{trajet.conducteur.prenom} {trajet.conducteur.nom}</p>
          <p className={styles.conducteurInfo}>⭐ {trajet.conducteur.note?.toFixed(1) ?? 'N/A'} · 📞 {trajet.conducteur.telephone}</p>
          {trajet.conducteur.vehicule?.marque && (
            <p className={styles.conducteurInfo}>
              🚗 {trajet.conducteur.vehicule.marque} {trajet.conducteur.vehicule.modele} · {trajet.conducteur.vehicule.couleur}
            </p>
          )}
        </div>
      )}

      {!estConducteur && placesRestantes > 0 && trajet.statut === 'disponible' && (
        <div className={styles.section}>
          <h2>Réserver</h2>

          {message && <p className={styles.messageInfo}>{message}</p>}

          <div className={styles.nbPlaces}>
            <button onClick={() => setNbPlaces(n => Math.max(1, n - 1))} className={styles.btnQte}>−</button>
            <span>{nbPlaces} place(s)</span>
            <button onClick={() => setNbPlaces(n => Math.min(placesRestantes, n + 1))} className={styles.btnQte}>+</button>
          </div>

          <div className={styles.paiements}>
            {PAIEMENTS.map(p => (
              <button
                key={p.val}
                className={`${styles.paiementBtn} ${modePaiement === p.val ? styles.actif : ''}`}
                onClick={() => setModePaiement(p.val)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <p className={styles.total}>Total : {(nbPlaces * trajet.prixParPlace).toLocaleString()} Ar</p>

          <button onClick={handleReserver} disabled={reservant} className={styles.btnReserver}>
            {reservant ? 'Réservation...' : 'Réserver'}
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Calendar, Clock, Users,
  Phone, Car, Star, CheckCircle, AlertCircle,
} from 'lucide-react';
import { getTrajet, reserverTrajet } from '@/lib/api';
import { Trajet, ModePaiement } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import TrajetMap from '@/components/TrajetMapDynamic';
import styles from './trajet.module.scss';

const PAIEMENTS: { val: ModePaiement; label: string }[] = [
  { val: 'especes',      label: 'Espèces' },
  { val: 'mvola',        label: 'MVola' },
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
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    getTrajet(id)
      .then(setTrajet)
      .catch(() => router.push('/'))
      .finally(() => setChargement(false));
  }, [id]);

  const handleReserver = async () => {
    if (!user) return router.push('/login');
    setReservant(true);
    setErreur('');
    try {
      await reserverTrajet({ trajetId: id, nbPlaces, modePaiement });
      setMessage('Réservation envoyée ! Attendez la confirmation du conducteur.');
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setReservant(false);
    }
  };

  if (chargement) return <div className={styles.spinner}><div className={styles.spinnerInner} /></div>;
  if (!trajet) return null;

  const placesRestantes = trajet.placesDisponibles - trajet.placesReservees;
  const estConducteur = trajet.conducteur?.id === user?.id || trajet.conducteur?._id === user?.id;

  return (
    <div className={styles.page}>
{/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroRoute}>
          <span className={styles.heroVille}>{trajet.depart.ville}</span>
          <span className={styles.heroFleche}>→</span>
          <span className={styles.heroVille}>{trajet.arrivee.ville}</span>
        </div>
        <div className={styles.heroPrix}>{(nbPlaces * trajet.prixParPlace).toLocaleString()} Ar</div>
        <div className={styles.heroPrixLabel}>{nbPlaces > 1 ? `${nbPlaces} places` : 'par place'}</div>
        <div className={styles.heroMeta}>
          <span className={styles.heroMetaItem}><Calendar size={14} />{new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className={styles.heroMetaItem}><Clock size={14} />{trajet.heureDepart}</span>
          <span className={styles.heroMetaItem}><Users size={14} />{placesRestantes} place{placesRestantes > 1 ? 's' : ''} restante{placesRestantes > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Carte */}
      <div className={styles.section}>
        <p className={styles.sectionTitre}>Itinéraire</p>
        <TrajetMap depart={trajet.depart.ville} arrivee={trajet.arrivee.ville} />
      </div>

      {/* Conducteur */}
      {trajet.conducteur && (
        <div className={styles.section}>
          <p className={styles.sectionTitre}>Conducteur</p>
          <div className={styles.conducteurRow}>
            <div className={styles.conducteurAvatar}>
              {trajet.conducteur.prenom?.[0]}{trajet.conducteur.nom?.[0]}
            </div>
            <div className={styles.conducteurInfos}>
              <div className={styles.conducteurNom}>{trajet.conducteur.prenom} {trajet.conducteur.nom}</div>
              <div className={styles.conducteurMeta}>
                {trajet.conducteur.note != null && (
                  <span className={styles.note}>
                    <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                    {trajet.conducteur.note.toFixed(1)}
                  </span>
                )}
                {trajet.conducteur.telephone && (
                  <span><Phone size={13} />{trajet.conducteur.telephone}</span>
                )}
                {trajet.conducteur.vehicule?.marque && (
                  <span><Car size={13} />{trajet.conducteur.vehicule.marque} {trajet.conducteur.vehicule.modele} · {trajet.conducteur.vehicule.couleur}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Réservation */}
      {estConducteur ? (
        <div className={styles.section}>
          <span className={styles.conducteurBadge}><CheckCircle size={15} /> C'est votre trajet</span>
        </div>
      ) : placesRestantes > 0 && trajet.statut === 'disponible' ? (
        <div className={styles.section}>
          <p className={styles.sectionTitre}>Réserver</p>

          {message && (
            <div className={styles.messageInfo}><CheckCircle size={16} />{message}</div>
          )}
          {erreur && (
            <div className={styles.messageErreur}><AlertCircle size={16} />{erreur}</div>
          )}

          {!message && (
            <>
              <div className={styles.placesSelector}>
                <span className={styles.placesSelectorLabel}>Nombre de places</span>
                <div className={styles.placesControls}>
                  <button className={styles.btnQte} onClick={() => setNbPlaces(n => Math.max(1, n - 1))} disabled={nbPlaces <= 1}>−</button>
                  <span className={styles.placesNb}>{nbPlaces}</span>
                  <button className={styles.btnQte} onClick={() => setNbPlaces(n => Math.min(placesRestantes, n + 1))} disabled={nbPlaces >= placesRestantes}>+</button>
                </div>
              </div>

              <p className={styles.paiementsLabel}>Mode de paiement</p>
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

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span>
                  <span className={styles.totalMontant}>{(nbPlaces * trajet.prixParPlace).toLocaleString()}</span>
                  <span className={styles.totalDevise}>Ar</span>
                </span>
              </div>

              <button onClick={handleReserver} disabled={reservant} className={styles.btnReserver}>
                {reservant ? 'Réservation en cours...' : 'Confirmer la réservation'}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

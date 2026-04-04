'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Calendar, Clock, Users, Banknote, Phone,
  CreditCard, ChevronDown, ChevronUp, XCircle, CheckCircle, X,
} from 'lucide-react';
import { mesTrajets, annulerTrajet, reservationsTrajet, changerStatutReservation } from '@/lib/api';
import { Trajet, Reservation } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './conducteur.module.scss';

const STATUT_TRAJET: Record<string, { label: string; couleur: string }> = {
  disponible: { label: 'Disponible', couleur: '#1E6B3C' },
  complet:    { label: 'Complet',    couleur: '#f59e0b' },
  en_cours:   { label: 'En cours',   couleur: '#3b82f6' },
  termine:    { label: 'Terminé',    couleur: '#6b7280' },
  annule:     { label: 'Annulé',     couleur: '#e74c3c' },
};

const STATUT_REZ: Record<string, { label: string; couleur: string }> = {
  en_attente: { label: 'En attente', couleur: '#f59e0b' },
  confirme:   { label: 'Confirmé',   couleur: '#1E6B3C' },
  refuse:     { label: 'Refusé',     couleur: '#e74c3c' },
  annule:     { label: 'Annulé',     couleur: '#9ca3af' },
  termine:    { label: 'Terminé',    couleur: '#6b7280' },
};

const MODE_PAIEMENT: Record<string, string> = {
  especes:      'Espèces',
  mvola:        'MVola',
  orange_money: 'Orange Money',
};

export default function ConducteurPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [chargement, setChargement] = useState(true);
  const [trajetOuvert, setTrajetOuvert] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Record<string, Reservation[]>>({});
  const [chargementRez, setChargementRez] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (user.role !== 'conducteur' && user.role !== 'les_deux') { router.push('/'); return; }
    mesTrajets()
      .then(setTrajets)
      .catch(() => setTrajets([]))
      .finally(() => setChargement(false));
  }, [user]);

  const toggleReservations = async (trajetId: string) => {
    if (trajetOuvert === trajetId) { setTrajetOuvert(null); return; }
    setTrajetOuvert(trajetId);
    if (reservations[trajetId]) return;
    setChargementRez(trajetId);
    try {
      const data = await reservationsTrajet(trajetId);
      setReservations(r => ({ ...r, [trajetId]: data }));
    } catch {
      setReservations(r => ({ ...r, [trajetId]: [] }));
    } finally {
      setChargementRez(null);
    }
  };

  const handleStatut = async (rezId: string, statut: 'confirme' | 'refuse', trajetId: string) => {
    try {
      await changerStatutReservation(rezId, statut);
      setReservations(r => ({
        ...r,
        [trajetId]: r[trajetId].map(rez => rez._id === rezId ? { ...rez, statut } : rez),
      }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAnnuler = async (trajetId: string) => {
    if (!confirm('Annuler ce trajet ?')) return;
    try {
      await annulerTrajet(trajetId);
      setTrajets(t => t.map(tr => tr._id === trajetId ? { ...tr, statut: 'annule' } : tr));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (chargement) return <div className={styles.spinner}><div className={styles.spinnerInner} /></div>;

  return (
    <div className={styles.container}>
      <div className={styles.entete}>
        <div>
          <h1 className={styles.titre}>Mes trajets</h1>
          <p className={styles.sousTitre}>{trajets.length} trajet{trajets.length !== 1 ? 's' : ''} publié{trajets.length !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.btnPublier} onClick={() => router.push('/publier')}>
          <Plus size={16} />
          Publier un trajet
        </button>
      </div>

      {trajets.length === 0 ? (
        <div className={styles.vide}>
          <Users size={48} strokeWidth={1.5} />
          <p>Vous n'avez pas encore publié de trajet.</p>
          <button className={styles.btnPublier} onClick={() => router.push('/publier')}>
            <Plus size={16} /> Publier mon premier trajet
          </button>
        </div>
      ) : (
        <div className={styles.liste}>
          {trajets.map(trajet => {
            const st = STATUT_TRAJET[trajet.statut] ?? { label: trajet.statut, couleur: '#999' };
            const ouvert = trajetOuvert === trajet._id;
            const rezListe = reservations[trajet._id] ?? [];
            const nbEnAttente = rezListe.filter(r => r.statut === 'en_attente').length;

            return (
              <div key={trajet._id} className={styles.carte}>
                {/* Header trajet */}
                <div className={styles.carteTop}>
                  <div className={styles.route}>
                    <span className={styles.ville}>{trajet.depart.ville}</span>
                    <span className={styles.fleche}>→</span>
                    <span className={styles.ville}>{trajet.arrivee.ville}</span>
                  </div>
                  <span className={styles.badge} style={{ backgroundColor: st.couleur }}>
                    {st.label}
                  </span>
                </div>

                {/* Méta infos */}
                <div className={styles.metaRow}>
                  <span className={styles.meta}><Calendar size={13} />{new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className={styles.meta}><Clock size={13} />{trajet.heureDepart}</span>
                  <span className={styles.meta}><Users size={13} />{trajet.placesReservees}/{trajet.placesDisponibles} places</span>
                  <span className={styles.meta}><Banknote size={13} />{trajet.prixParPlace.toLocaleString()} Ar</span>
                </div>

                {/* Barre de progression places */}
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(trajet.placesReservees / trajet.placesDisponibles) * 100}%` }}
                  />
                </div>

                {/* Actions */}
                <div className={styles.actions}>
                  <button className={styles.btnRez} onClick={() => toggleReservations(trajet._id)}>
                    {ouvert ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    Réservations
                    {nbEnAttente > 0 && <span className={styles.pill}>{nbEnAttente}</span>}
                  </button>
                  {trajet.statut !== 'annule' && trajet.statut !== 'termine' && (
                    <button className={styles.btnAnnuler} onClick={() => handleAnnuler(trajet._id)}>
                      <XCircle size={15} />
                      Annuler
                    </button>
                  )}
                </div>

                {/* Liste réservations dépliable */}
                {ouvert && (
                  <div className={styles.rezSection}>
                    {chargementRez === trajet._id ? (
                      <p className={styles.rezVide}>Chargement...</p>
                    ) : rezListe.length === 0 ? (
                      <p className={styles.rezVide}>Aucune réservation pour ce trajet.</p>
                    ) : (
                      rezListe.map(rez => {
                        const rs = STATUT_REZ[rez.statut] ?? { label: rez.statut, couleur: '#999' };
                        return (
                          <div key={rez._id} className={styles.rezCarte}>
                            <div className={styles.rezTop}>
                              <div className={styles.rezAvatar}>
                                {rez.passager?.prenom?.[0]}{rez.passager?.nom?.[0]}
                              </div>
                              <div className={styles.rezInfos}>
                                <span className={styles.rezNom}>{rez.passager?.prenom} {rez.passager?.nom}</span>
                                <div className={styles.rezMeta}>
                                  <span><Phone size={12} />{rez.passager?.telephone}</span>
                                  <span><Users size={12} />{rez.nbPlaces} place{rez.nbPlaces > 1 ? 's' : ''}</span>
                                  <span><Banknote size={12} />{rez.prixTotal.toLocaleString()} Ar</span>
                                  <span><CreditCard size={12} />{MODE_PAIEMENT[rez.modePaiement]}</span>
                                </div>
                              </div>
                              <span className={styles.badgeSm} style={{ backgroundColor: rs.couleur }}>
                                {rs.label}
                              </span>
                            </div>
                            {rez.statut === 'en_attente' && (
                              <div className={styles.rezBtns}>
                                <button className={styles.btnConfirmer} onClick={() => handleStatut(rez._id, 'confirme', trajet._id)}>
                                  <CheckCircle size={14} /> Confirmer
                                </button>
                                <button className={styles.btnRefuser} onClick={() => handleStatut(rez._id, 'refuse', trajet._id)}>
                                  <X size={14} /> Refuser
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

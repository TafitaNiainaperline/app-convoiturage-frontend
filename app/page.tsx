'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTrajets } from '@/lib/api';
import { Trajet } from '@/lib/types';
import styles from './home.module.scss';

const VILLES = ['Antananarivo', 'Tamatave', 'Fianarantsoa', 'Majunga', 'Diego-Suarez', 'Tuléar', 'Antsirabe'];

export default function HomePage() {
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtres, setFiltres] = useState({ depart: '', arrivee: '' });

  const charger = async () => {
    setChargement(true);
    try {
      const data = await getTrajets(filtres);
      setTrajets(data);
    } catch {
      setTrajets([]);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  return (
    <div>
      <h1 className={styles.titre}>Trouver un trajet</h1>

      <div className={styles.filtres}>
        <select value={filtres.depart} onChange={e => setFiltres(f => ({ ...f, depart: e.target.value }))}>
          <option value="">Départ — toutes villes</option>
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={filtres.arrivee} onChange={e => setFiltres(f => ({ ...f, arrivee: e.target.value }))}>
          <option value="">Arrivée — toutes villes</option>
          {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <button onClick={charger} className={styles.btnRecherche}>Rechercher</button>
      </div>

      {chargement ? (
        <p className={styles.chargement}>Chargement...</p>
      ) : trajets.length === 0 ? (
        <p className={styles.vide}>Aucun trajet disponible.</p>
      ) : (
        <div className={styles.grille}>
          {trajets.map(trajet => (
            <Link href={`/trajet/${trajet._id}`} key={trajet._id} className={styles.carte}>
              <div className={styles.carteHeader}>
                <span className={styles.villes}>{trajet.depart.ville} → {trajet.arrivee.ville}</span>
                <span className={styles.prix}>{trajet.prixParPlace.toLocaleString()} Ar</span>
              </div>
              <div className={styles.carteInfos}>
                <span>📅 {new Date(trajet.dateDepart).toLocaleDateString('fr-FR')} à {trajet.heureDepart}</span>
                <span>💺 {trajet.placesDisponibles - trajet.placesReservees} place(s)</span>
              </div>
              {trajet.conducteur && (
                <p className={styles.conducteur}>
                  🧑 {trajet.conducteur.prenom} {trajet.conducteur.nom} · ⭐ {trajet.conducteur.note?.toFixed(1) ?? 'N/A'}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

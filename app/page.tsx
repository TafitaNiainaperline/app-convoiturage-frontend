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
      {/* Hero */}
      <div className={styles.hero}>
        <h1>Voyagez ensemble à Madagascar</h1>
        <p>Trouvez un trajet partagé vers votre destination</p>

        <div className={styles.recherche}>
          <div className={styles.rechercheChamp}>
            <span className={styles.rechercheIcon}>📍</span>
            <select value={filtres.depart} onChange={e => setFiltres(f => ({ ...f, depart: e.target.value }))}>
              <option value="">Ville de départ</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className={styles.separateur}>→</div>
          <div className={styles.rechercheChamp}>
            <span className={styles.rechercheIcon}>🏁</span>
            <select value={filtres.arrivee} onChange={e => setFiltres(f => ({ ...f, arrivee: e.target.value }))}>
              <option value="">Ville d'arrivée</option>
              {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <button onClick={charger} className={styles.btnRecherche}>
            Rechercher
          </button>
        </div>
      </div>

      {/* Résultats */}
      <div className={styles.resultats}>
        <div className={styles.resultatsHeader}>
          <h2>{chargement ? 'Chargement...' : `${trajets.length} trajet(s) disponible(s)`}</h2>
        </div>

        {chargement ? (
          <div className={styles.loader}>
            <div className={styles.loaderSpinner} />
          </div>
        ) : trajets.length === 0 ? (
          <div className={styles.vide}>
            <span>🚗</span>
            <p>Aucun trajet disponible pour le moment.</p>
            <Link href="/publier" className={styles.btnPublier}>Publier un trajet</Link>
          </div>
        ) : (
          <div className={styles.liste}>
            {trajets.map(trajet => (
              <Link href={`/trajet/${trajet._id}`} key={trajet._id} className={styles.carte}>
                <div className={styles.carteGauche}>
                  <div className={styles.trajetRoute}>
                    <div className={styles.ville}>
                      <span className={styles.dot} />
                      <span>{trajet.depart.ville}</span>
                    </div>
                    <div className={styles.ligne} />
                    <div className={styles.ville}>
                      <span className={styles.dotArrivee} />
                      <span>{trajet.arrivee.ville}</span>
                    </div>
                  </div>
                  <div className={styles.carteMeta}>
                    <span>📅 {new Date(trajet.dateDepart).toLocaleDateString('fr-FR')}</span>
                    <span>🕐 {trajet.heureDepart}</span>
                    <span>💺 {trajet.placesDisponibles - trajet.placesReservees} place(s)</span>
                  </div>
                </div>

                <div className={styles.carteDroite}>
                  {trajet.conducteur && (
                    <div className={styles.conducteur}>
                      <div className={styles.conducteurAvatar}>
                        {trajet.conducteur.prenom[0]}{trajet.conducteur.nom[0]}
                      </div>
                      <div>
                        <p className={styles.conducteurNom}>{trajet.conducteur.prenom} {trajet.conducteur.nom}</p>
                        <p className={styles.conducteurNote}>⭐ {trajet.conducteur.note?.toFixed(1) ?? 'N/A'}</p>
                      </div>
                    </div>
                  )}
                  <div className={styles.prix}>
                    <span>{trajet.prixParPlace.toLocaleString()}</span>
                    <small>Ar / place</small>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

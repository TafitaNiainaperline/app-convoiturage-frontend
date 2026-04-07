'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Flag, Search, Calendar, Clock, Users, Star, ArrowRight, Car } from 'lucide-react';
import { getTrajets, mesReservations } from '@/lib/api';
import { Trajet, Reservation } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './home.module.scss';

const VILLES = ['Antananarivo', 'Tamatave', 'Fianarantsoa', 'Majunga', 'Diego-Suarez', 'Tuléar', 'Antsirabe'];

export default function HomePage() {
  const { user } = useAuth();
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [chargement, setChargement] = useState(true);
  const [filtres, setFiltres] = useState({ depart: '', arrivee: '' });
  const [mesRez, setMesRez] = useState<Reservation[]>([]);

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

  useEffect(() => {
    if (user) mesReservations().then(setMesRez).catch(() => {});
    else setMesRez([]);
  }, [user]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroDecor} />
        <div className={styles.heroContent}>
          <h1>Voyagez ensemble<br />à Madagascar</h1>
          <p>Trouvez un trajet partagé, économique et convivial</p>

          <div className={styles.searchBox}>
            <div className={styles.searchField}>
              <MapPin size={18} className={styles.searchFieldIcon} />
              <select
                value={filtres.depart}
                onChange={e => setFiltres(f => ({ ...f, depart: e.target.value }))}
              >
                <option value="">Ville de départ</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className={styles.searchDivider}>
              <ArrowRight size={16} />
            </div>

            <div className={styles.searchField}>
              <Flag size={18} className={styles.searchFieldIcon} />
              <select
                value={filtres.arrivee}
                onChange={e => setFiltres(f => ({ ...f, arrivee: e.target.value }))}
              >
                <option value="">Ville d'arrivée</option>
                {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <button onClick={charger} className={styles.searchBtn}>
              <Search size={18} />
              Rechercher
            </button>
          </div>
        </div>
      </section>

      {/* Résultats */}
      <section className={styles.results}>
        <div className={styles.resultsHeader}>
          <h2>
            {chargement ? 'Chargement...' : `${trajets.length} trajet${trajets.length > 1 ? 's' : ''} disponible${trajets.length > 1 ? 's' : ''}`}
          </h2>
        </div>

        {chargement ? (
          <div className={styles.loader}>
            <div className={styles.spinner} />
          </div>
        ) : trajets.length === 0 ? (
          <div className={styles.empty}>
            <Car size={48} strokeWidth={1.5} />
            <p>Aucun trajet disponible pour le moment.</p>
            <Link href="/publier" className={styles.emptyBtn}>Publier un trajet</Link>
          </div>
        ) : (
          <div className={styles.list}>
            {trajets.map(trajet => {
              const rez = mesRez.find(r => {
                const tid = typeof r.trajet === 'string' ? r.trajet : (r.trajet as any)?._id;
                return tid === trajet._id;
              });
              const dejaReserve = rez && rez.statut !== 'refuse' && rez.statut !== 'annule';
              return (
                <Link href={`/trajet/${trajet._id}`} key={trajet._id} className={styles.card}>
                  <div className={styles.cardLeft}>
                    <div className={styles.route}>
                      <div className={styles.routePoint}>
                        <span className={styles.routeDot} />
                        <span className={styles.routeCity}>{trajet.depart.ville}</span>
                      </div>
                      <div className={styles.routeLine} />
                      <div className={styles.routePoint}>
                        <span className={styles.routeDotEnd} />
                        <span className={styles.routeCity}>{trajet.arrivee.ville}</span>
                      </div>
                    </div>

                    <div className={styles.meta}>
                      <span><Calendar size={14} />{new Date(trajet.dateDepart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      <span><Clock size={14} />{trajet.heureDepart}</span>
                      <span><Users size={14} />{trajet.placesDisponibles - trajet.placesReservees} place{trajet.placesDisponibles - trajet.placesReservees > 1 ? 's' : ''}</span>
                    </div>

                    {dejaReserve && (
                      <span className={styles.badgeRez}>
                        ✓ {rez!.statut === 'confirme' ? 'Réservation confirmée' : 'Réservation en attente'}
                      </span>
                    )}
                  </div>

                  <div className={styles.cardRight}>
                    {trajet.conducteur && (
                      <div className={styles.driver}>
                        <div className={styles.driverAvatar}>
                          {trajet.conducteur.prenom[0]}{trajet.conducteur.nom[0]}
                        </div>
                        <div className={styles.driverInfo}>
                          <span className={styles.driverName}>{trajet.conducteur.prenom} {trajet.conducteur.nom}</span>
                          <span className={styles.driverRating}>
                            <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
                            {trajet.conducteur.note?.toFixed(1) ?? 'N/A'}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className={styles.price}>
                      <span className={styles.priceAmount}>{trajet.prixParPlace.toLocaleString()}</span>
                      <span className={styles.priceCurrency}>Ar</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

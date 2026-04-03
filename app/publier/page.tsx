'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { creerTrajet } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import styles from './publier.module.scss';

const VILLES = ['Antananarivo', 'Tamatave', 'Fianarantsoa', 'Majunga', 'Diego-Suarez', 'Tuléar', 'Antsirabe', 'Ambositra'];

export default function PublierPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState({
    departVille: '', arriveeVille: '', dateDepart: '',
    heureDepart: '', placesDisponibles: '3', prixParPlace: '', description: '',
  });
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user]);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.departVille || !form.arriveeVille) return setErreur('Sélectionnez les villes.');
    setErreur('');
    setChargement(true);
    try {
      await creerTrajet({
        depart: { ville: form.departVille },
        arrivee: { ville: form.arriveeVille },
        dateDepart: form.dateDepart,
        heureDepart: form.heureDepart,
        placesDisponibles: parseInt(form.placesDisponibles),
        prixParPlace: parseInt(form.prixParPlace),
        description: form.description,
      });
      router.push('/');
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.titre}>Publier un trajet</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        {erreur && <p className={styles.erreur}>{erreur}</p>}

        <div className={styles.champ}>
          <label>Ville de départ *</label>
          <div className={styles.villesGrid}>
            {VILLES.map(v => (
              <button key={v} type="button"
                className={`${styles.villeBtn} ${form.departVille === v ? styles.actif : ''}`}
                onClick={() => update('departVille', v)}>{v}</button>
            ))}
          </div>
        </div>

        <div className={styles.champ}>
          <label>Ville d'arrivée *</label>
          <div className={styles.villesGrid}>
            {VILLES.map(v => (
              <button key={v} type="button"
                className={`${styles.villeBtn} ${form.arriveeVille === v ? styles.actif : ''}`}
                onClick={() => update('arriveeVille', v)}>{v}</button>
            ))}
          </div>
        </div>

        <div className={styles.rangee}>
          <div className={styles.champ}>
            <label>Date *</label>
            <input type="date" value={form.dateDepart} onChange={e => update('dateDepart', e.target.value)} required />
          </div>
          <div className={styles.champ}>
            <label>Heure *</label>
            <input type="time" value={form.heureDepart} onChange={e => update('heureDepart', e.target.value)} required />
          </div>
        </div>

        <div className={styles.champ}>
          <label>Nombre de places *</label>
          <div className={styles.places}>
            {['1', '2', '3', '4', '5'].map(n => (
              <button key={n} type="button"
                className={`${styles.placeBtn} ${form.placesDisponibles === n ? styles.actif : ''}`}
                onClick={() => update('placesDisponibles', n)}>{n}</button>
            ))}
          </div>
        </div>

        <div className={styles.champ}>
          <label>Prix par place (Ariary) *</label>
          <input type="number" value={form.prixParPlace} onChange={e => update('prixParPlace', e.target.value)} placeholder="ex: 15000" required />
        </div>

        <div className={styles.champ}>
          <label>Description (optionnel)</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Infos utiles pour les passagers..." rows={3} />
        </div>

        <button type="submit" className={styles.bouton} disabled={chargement}>
          {chargement ? 'Publication...' : 'Publier le trajet'}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Flag, Calendar, Clock, Users, Banknote, AlertCircle, Send } from 'lucide-react';
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
    if (!form.departVille || !form.arriveeVille) return setErreur('Veuillez sélectionner les villes de départ et d\'arrivée.');
    if (form.departVille === form.arriveeVille) return setErreur('La ville de départ et d\'arrivée doivent être différentes.');
    setErreur('');
    setChargement(true);
    try {
      await creerTrajet({
        depart:            { ville: form.departVille },
        arrivee:           { ville: form.arriveeVille },
        dateDepart:        form.dateDepart,
        heureDepart:       form.heureDepart,
        placesDisponibles: parseInt(form.placesDisponibles),
        prixParPlace:      parseInt(form.prixParPlace),
        description:       form.description,
      });
      router.push('/conducteur');
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.entete}>
        <h1 className={styles.titre}>Publier un trajet</h1>
        <p className={styles.sousTitre}>Renseignez les informations de votre trajet</p>
      </div>

      {erreur && (
        <div className={styles.erreur}>
          <AlertCircle size={16} /> {erreur}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Itinéraire */}
        <div className={styles.section}>
          <p className={styles.sectionTitre}><MapPin size={13} style={{display:'inline',verticalAlign:'middle',marginRight:6}} />Itinéraire</p>

          <div className={styles.champ}>
            <label><MapPin size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} />Ville de départ</label>
            <div className={styles.villesGrid}>
              {VILLES.map(v => (
                <button key={v} type="button"
                  className={`${styles.villeBtn} ${form.departVille === v ? styles.actif : ''}`}
                  onClick={() => update('departVille', v)}>{v}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.champ}>
            <label><Flag size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} />Ville d'arrivée</label>
            <div className={styles.villesGrid}>
              {VILLES.map(v => (
                <button key={v} type="button"
                  className={`${styles.villeBtn} ${form.arriveeVille === v ? styles.actif : ''}`}
                  onClick={() => update('arriveeVille', v)}>{v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Date & heure */}
        <div className={styles.section}>
          <p className={styles.sectionTitre}><Calendar size={13} style={{display:'inline',verticalAlign:'middle',marginRight:6}} />Date & heure</p>
          <div className={styles.rangee}>
            <div className={styles.champ}>
              <label><Calendar size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} />Date</label>
              <input type="date" value={form.dateDepart} onChange={e => update('dateDepart', e.target.value)} required />
            </div>
            <div className={styles.champ}>
              <label><Clock size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} />Heure de départ</label>
              <input type="time" value={form.heureDepart} onChange={e => update('heureDepart', e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Places & prix */}
        <div className={styles.section}>
          <p className={styles.sectionTitre}><Users size={13} style={{display:'inline',verticalAlign:'middle',marginRight:6}} />Places & tarif</p>

          <div className={styles.champ}>
            <label><Users size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} />Nombre de places disponibles</label>
            <div className={styles.placesCounter}>
              <button type="button" className={styles.placesBtn}
                onClick={() => update('placesDisponibles', String(Math.max(1, parseInt(form.placesDisponibles) - 1)))}
                disabled={parseInt(form.placesDisponibles) <= 1}>−</button>
              <input
                type="number"
                className={styles.placesInput}
                value={form.placesDisponibles}
                min="1" max="100"
                onChange={e => {
                  const v = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                  update('placesDisponibles', String(v));
                }}
              />
              <button type="button" className={styles.placesBtn}
                onClick={() => update('placesDisponibles', String(Math.min(100, parseInt(form.placesDisponibles) + 1)))}
                disabled={parseInt(form.placesDisponibles) >= 100}>+</button>
            </div>
          </div>

          <div className={styles.champ}>
            <label><Banknote size={13} style={{display:'inline',verticalAlign:'middle',marginRight:5}} />Prix par place (Ariary)</label>
            <input
              type="number"
              value={form.prixParPlace}
              onChange={e => update('prixParPlace', e.target.value)}
              placeholder="ex : 15 000"
              min="0"
              required
            />
          </div>
        </div>


        <button type="submit" className={styles.bouton} disabled={chargement}>
          <Send size={16} />
          {chargement ? 'Publication en cours...' : 'Publier le trajet'}
        </button>
      </form>
    </div>
  );
}

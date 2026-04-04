'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './register.module.scss';

type Role = 'passager' | 'conducteur';

export default function RegisterPage() {
  const router = useRouter();
  const { inscrire } = useAuth();
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', motDePasse: '', role: 'passager' as Role,
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await inscrire(form);
      router.push('/');
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Côté gauche */}
      <div className={styles.hero}>
        <div className={styles.heroLogo}>
          <Car size={24} />
          Covoiturage Mada
        </div>
        <h1 className={styles.heroTitre}>
          Voyagez ensemble<br />à Madagascar
        </h1>
        <p className={styles.heroSousTitre}>
          Trouvez ou proposez un trajet partagé, économique et convivial entre les grandes villes.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNb}>8+</span>
            <span className={styles.heroStatLabel}>Villes desservies</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNb}>100%</span>
            <span className={styles.heroStatLabel}>Gratuit à utiliser</span>
          </div>
        </div>
      </div>

      {/* Côté droit */}
      <div className={styles.formSide}>
        <div className={styles.formCard}>
        <h2 className={styles.formTitre}>Créer un compte</h2>
        <p className={styles.formSousTitre}>Inscription gratuite en quelques secondes</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {erreur && (
            <div className={styles.erreur}>
              <AlertCircle size={16} /> {erreur}
            </div>
          )}

          <div className={styles.champ}>
            <label>Nom complet</label>
            <input
              value={form.nom}
              onChange={e => update('nom', e.target.value)}
              placeholder="Rakoto Jean"
              required
            />
          </div>

          <div className={styles.champ}>
            <label>Adresse email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className={styles.champ}>
            <label>Téléphone</label>
            <input
              type="tel"
              value={form.telephone}
              onChange={e => update('telephone', e.target.value)}
              placeholder="034 XX XXX XX"
              required
            />
          </div>

          <div className={styles.champ}>
            <label>Mot de passe</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.motDePasse}
                onChange={e => update('motDePasse', e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.champ}>
            <label>Je suis</label>
            <div className={styles.roles}>
              {([['passager', 'Passager'], ['conducteur', 'Conducteur']] as [Role, string][]).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  className={`${styles.roleBtn} ${form.role === val ? styles.actif : ''}`}
                  onClick={() => update('role', val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className={styles.bouton} disabled={chargement}>
            {chargement ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

        <p className={styles.lien}>
          Déjà un compte ?{' '}
          <Link href="/login">Se connecter</Link>
        </p>
        </div>
      </div>
    </div>
  );
}

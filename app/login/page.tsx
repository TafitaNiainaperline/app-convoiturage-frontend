'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import styles from './login.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const { connecter } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);
    try {
      await connecter(email, motDePasse);
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
          <h2 className={styles.formTitre}>Bon retour !</h2>
          <p className={styles.formSousTitre}>Connectez-vous à votre compte</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {erreur && (
              <div className={styles.erreur}>
                <AlertCircle size={16} /> {erreur}
              </div>
            )}

            <div className={styles.champ}>
              <label>Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className={styles.champ}>
              <label>Mot de passe</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={motDePasse}
                  onChange={e => setMotDePasse(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button type="button" className={styles.togglePassword} onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.bouton} disabled={chargement}>
              {chargement ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <p className={styles.lien}>
            Pas encore de compte ?{' '}
            <Link href="/register">S'inscrire gratuitement</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

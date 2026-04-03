'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from './login.module.scss';

export default function LoginPage() {
  const router = useRouter();
  const { connecter } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

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
    <div className={styles.container}>
      <div className={styles.carte}>
        <h1 className={styles.titre}>Covoiturage Mada</h1>
        <p className={styles.sousTitre}>Connectez-vous</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {erreur && <p className={styles.erreur}>{erreur}</p>}

          <div className={styles.champ}>
            <label>Email</label>
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
            <input
              type="password"
              value={motDePasse}
              onChange={e => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.bouton} disabled={chargement}>
            {chargement ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className={styles.lien}>
          Pas encore de compte ?{' '}
          <Link href="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

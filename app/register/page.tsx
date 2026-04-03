'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import styles from './register.module.scss';

type Role = 'passager' | 'conducteur' | 'les_deux';

export default function RegisterPage() {
  const router = useRouter();
  const { inscrire } = useAuth();
  const [form, setForm] = useState({
    nom: '', email: '', telephone: '', motDePasse: '', role: 'passager' as Role,
  });
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

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
    <div className={styles.container}>
      <div className={styles.carte}>
        <h1 className={styles.titre}>Créer un compte</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          {erreur && <p className={styles.erreur}>{erreur}</p>}

          <div className={styles.champ}>
            <label>Nom</label>
            <input value={form.nom} onChange={e => update('nom', e.target.value)} placeholder="Rakoto" required />
          </div>

          <div className={styles.champ}>
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="votre@email.com" required />
          </div>

          <div className={styles.champ}>
            <label>Téléphone</label>
            <input type="tel" value={form.telephone} onChange={e => update('telephone', e.target.value)} placeholder="034 XX XXX XX" required />
          </div>

          <div className={styles.champ}>
            <label>Mot de passe</label>
            <input type="password" value={form.motDePasse} onChange={e => update('motDePasse', e.target.value)} placeholder="••••••••" required />
          </div>

          <div className={styles.champ}>
            <label>Je suis</label>
            <div className={styles.roles}>
              {([['passager', 'Passager'], ['conducteur', 'Conducteur'], ['les_deux', 'Les deux']] as [Role, string][]).map(([val, label]) => (
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
            {chargement ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className={styles.lien}>
          Déjà un compte ?{' '}
          <Link href="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

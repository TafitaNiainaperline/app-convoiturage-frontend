'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfil } from '@/lib/api';
import { User } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './profil.module.scss';

export default function ProfilPage() {
  const router = useRouter();
  const { user, deconnecter } = useAuth();
  const [profil, setProfil] = useState<User | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    getProfil()
      .then(setProfil)
      .catch(() => setProfil(user))
      .finally(() => setChargement(false));
  }, [user]);

  const handleDeconnexion = () => {
    if (!confirm('Voulez-vous vous déconnecter ?')) return;
    deconnecter();
    router.push('/login');
  };

  if (chargement) return <p className={styles.chargement}>Chargement...</p>;

  const p = profil ?? user;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <span>{p?.prenom?.[0]}{p?.nom?.[0]}</span>
        </div>
        <div>
          <h1 className={styles.nom}>{p?.prenom} {p?.nom}</h1>
          <p className={styles.email}>{p?.email}</p>
          <span className={styles.role}>
            {p?.role === 'passager' ? '🧳 Passager' : p?.role === 'conducteur' ? '🚗 Conducteur' : '🔄 Passager & Conducteur'}
          </span>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Informations</h2>
        <div className={styles.infos}>
          <InfoLigne label="Téléphone" value={p?.telephone} />
          <InfoLigne label="Note" value={p?.note ? `⭐ ${p.note.toFixed(1)} (${p.nbAvis} avis)` : 'Pas encore noté'} />
          <InfoLigne label="Membre depuis" value={p?.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '-'} />
        </div>
      </div>

      {p?.vehicule?.marque && (
        <div className={styles.section}>
          <h2>Mon véhicule</h2>
          <div className={styles.infos}>
            <InfoLigne label="Marque / Modèle" value={`${p.vehicule.marque} ${p.vehicule.modele}`} />
            <InfoLigne label="Couleur" value={p.vehicule.couleur} />
            <InfoLigne label="Immatriculation" value={p.vehicule.immatriculation} />
            <InfoLigne label="Places" value={`${p.vehicule.places}`} />
          </div>
        </div>
      )}

      <button className={styles.btnDeconnexion} onClick={handleDeconnexion}>
        Se déconnecter
      </button>
    </div>
  );
}

function InfoLigne({ label, value }: { label: string; value?: string }) {
  return (
    <div className={styles.ligne}>
      <span className={styles.ligneLabel}>{label}</span>
      <span className={styles.ligneValue}>{value || '-'}</span>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Mail, Calendar, Star, Car, LogOut, Shield, Pencil, Check, X, AlertCircle } from 'lucide-react';
import { getProfil, modifierProfil } from '@/lib/api';
import { User } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import styles from './profil.module.scss';

const ROLE_LABEL: Record<string, string> = {
  passager:   'Passager',
  conducteur: 'Conducteur',
  les_deux:   'Passager & Conducteur',
};

export default function ProfilPage() {
  const router = useRouter();
  const { user, deconnecter } = useAuth();
  const [profil, setProfil] = useState<User | null>(null);
  const [chargement, setChargement] = useState(true);
  const [edition, setEdition] = useState(false);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    telephone: '',
  });

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    getProfil()
      .then(data => {
        setProfil(data);
        setForm({ prenom: data.prenom, nom: data.nom, telephone: data.telephone || '' });
      })
      .catch(() => {
        setProfil(user);
        setForm({ prenom: user.prenom, nom: user.nom, telephone: user.telephone || '' });
      })
      .finally(() => setChargement(false));
  }, [user]);

  const handleDeconnexion = () => {
    if (!confirm('Voulez-vous vous déconnecter ?')) return;
    deconnecter();
    router.push('/login');
  };

  const handleSauvegarder = async () => {
    setSauvegarde(true);
    setErreur('');
    setSucces('');
    try {
      const updated = await modifierProfil(form);
      setProfil(updated);
      setEdition(false);
      setSucces('Profil mis à jour avec succès.');
      setTimeout(() => setSucces(''), 3000);
    } catch (err: any) {
      setErreur(err.message);
    } finally {
      setSauvegarde(false);
    }
  };

  const handleAnnuler = () => {
    if (profil) setForm({ prenom: profil.prenom, nom: profil.nom, telephone: profil.telephone || '' });
    setEdition(false);
    setErreur('');
  };

  if (chargement) return <div className={styles.spinner}><div className={styles.spinnerInner} /></div>;

  const p = profil ?? user;

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.avatar}>
          {(edition ? form.prenom : p?.prenom)?.[0]}{(edition ? form.nom : p?.nom)?.[0]}
        </div>
        <div className={styles.heroInfos}>
          <div className={styles.nom}>{edition ? `${form.prenom} ${form.nom}` : `${p?.prenom} ${p?.nom}`}</div>
          <div className={styles.email}>{p?.email}</div>
          <span className={styles.roleBadge}>
            <Shield size={12} />
            {p?.role ? ROLE_LABEL[p.role] : '—'}
          </span>
        </div>
      </div>

      {/* Messages */}
      {succes && (
        <div className={styles.messageSucces}>
          <Check size={15} /> {succes}
        </div>
      )}

      {/* Informations */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTitre}>Informations</p>
          {!edition ? (
            <button className={styles.btnEditer} onClick={() => setEdition(true)}>
              <Pencil size={13} /> Modifier
            </button>
          ) : (
            <div className={styles.actionsEdition}>
              <button className={styles.btnAnnuler} onClick={handleAnnuler}>
                <X size={13} /> Annuler
              </button>
              <button className={styles.btnSauvegarder} onClick={handleSauvegarder} disabled={sauvegarde}>
                <Check size={13} /> {sauvegarde ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>

        {erreur && (
          <div className={styles.messageErreur}>
            <AlertCircle size={14} /> {erreur}
          </div>
        )}

        {edition ? (
          <div className={styles.formEdition}>
            <div className={styles.champEdition}>
              <label>Prénom</label>
              <input value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} />
            </div>
            <div className={styles.champEdition}>
              <label>Nom</label>
              <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
            </div>
            <div className={styles.champEdition}>
              <label>Téléphone</label>
              <input value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} placeholder="Ex: 034 00 000 00" />
            </div>
          </div>
        ) : (
          <>
            <div className={styles.ligne}>
              <span className={styles.ligneGauche}><Phone size={15} />Téléphone</span>
              <span className={styles.ligneValeur}>{p?.telephone || '—'}</span>
            </div>
            <div className={styles.ligne}>
              <span className={styles.ligneGauche}><Mail size={15} />Email</span>
              <span className={styles.ligneValeur}>{p?.email || '—'}</span>
            </div>
            <div className={styles.ligne}>
              <span className={styles.ligneGauche}><Calendar size={15} />Membre depuis</span>
              <span className={styles.ligneValeur}>
                {p?.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Statistiques */}
      {(p?.note != null || p?.nbAvis != null) && (
        <div className={styles.section}>
          <p className={styles.sectionTitre}>Statistiques</p>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statValeur}>
                {p.note != null ? (
                  <><Star size={16} style={{ display:'inline', color:'#f59e0b', fill:'#f59e0b', verticalAlign:'middle', marginRight:4 }} />{p.note.toFixed(1)}</>
                ) : '—'}
              </span>
              <span className={styles.statLabel}>Note moyenne</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValeur}>{p.nbAvis ?? 0}</span>
              <span className={styles.statLabel}>Avis reçus</span>
            </div>
          </div>
        </div>
      )}

      {/* Véhicule */}
      {p?.vehicule?.marque && (
        <div className={styles.section}>
          <p className={styles.sectionTitre}>Mon véhicule</p>
          <div className={styles.ligne}>
            <span className={styles.ligneGauche}><Car size={15} />Marque / Modèle</span>
            <span className={styles.ligneValeur}>{p.vehicule.marque} {p.vehicule.modele}</span>
          </div>
          <div className={styles.ligne}>
            <span className={styles.ligneGauche}><Car size={15} />Couleur</span>
            <span className={styles.ligneValeur}>{p.vehicule.couleur || '—'}</span>
          </div>
          <div className={styles.ligne}>
            <span className={styles.ligneGauche}><Car size={15} />Immatriculation</span>
            <span className={styles.ligneValeur}>{p.vehicule.immatriculation || '—'}</span>
          </div>
          <div className={styles.ligne}>
            <span className={styles.ligneGauche}><Car size={15} />Places</span>
            <span className={styles.ligneValeur}>{p.vehicule.places ?? '—'}</span>
          </div>
        </div>
      )}

      <button className={styles.btnDeconnexion} onClick={handleDeconnexion}>
        <LogOut size={16} /> Se déconnecter
      </button>
    </div>
  );
}

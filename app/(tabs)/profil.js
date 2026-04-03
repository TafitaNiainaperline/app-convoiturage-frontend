import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { getProfil } from '../../src/services/api';

export default function Profil() {
  const router = useRouter();
  const { user, deconnecter } = useAuth();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getProfil()
      .then(res => setProfil(res.data))
      .catch(() => setProfil(user))
      .finally(() => setChargement(false));
  }, []);

  const handleDeconnexion = () => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler' },
      { text: 'Déconnecter', style: 'destructive', onPress: async () => { await deconnecter(); router.replace('/auth/login'); } }
    ]);
  };

  if (chargement) return <ActivityIndicator size="large" color="#1E6B3C" style={{ flex: 1, marginTop: 100 }} />;

  const p = profil || user;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{p?.prenom?.[0]}{p?.nom?.[0]}</Text>
        </View>
        <Text style={styles.nom}>{p?.prenom} {p?.nom}</Text>
        <Text style={styles.email}>{p?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleTxt}>
            {p?.role === 'passager' ? '🧳 Passager' : p?.role === 'conducteur' ? '🚗 Conducteur' : '🔄 Passager & Conducteur'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <InfoLigne label="Téléphone" value={p?.telephone} />
        <InfoLigne label="Note" value={p?.note ? `⭐ ${p.note.toFixed(1)} (${p.nbAvis} avis)` : 'Pas encore noté'} />
        <InfoLigne label="Membre depuis" value={p?.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR') : '-'} />
      </View>

      {p?.vehicule?.marque && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Mon véhicule</Text>
          <InfoLigne label="Marque / Modèle" value={`${p.vehicule.marque} ${p.vehicule.modele}`} />
          <InfoLigne label="Couleur" value={p.vehicule.couleur} />
          <InfoLigne label="Immatriculation" value={p.vehicule.immatriculation} />
          <InfoLigne label="Places" value={`${p.vehicule.places}`} />
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnDeconnexion} onPress={handleDeconnexion}>
          <Text style={styles.btnDeconnexionTxt}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoLigne({ label, value }) {
  return (
    <View style={styles.ligne}>
      <Text style={styles.ligneLabel}>{label}</Text>
      <Text style={styles.ligneValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1E6B3C', padding: 30, alignItems: 'center', paddingTop: 60 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarTxt: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  nom: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleTxt: { color: '#fff', fontSize: 13 },
  section: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16 },
  sectionTitre: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  ligne: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  ligneLabel: { color: '#888', fontSize: 14 },
  ligneValue: { color: '#222', fontWeight: '600', fontSize: 14 },
  actions: { padding: 16, paddingBottom: 40 },
  btnDeconnexion: { borderWidth: 1, borderColor: '#e74c3c', borderRadius: 10, padding: 14, alignItems: 'center' },
  btnDeconnexionTxt: { color: '#e74c3c', fontWeight: 'bold', fontSize: 16 },
});

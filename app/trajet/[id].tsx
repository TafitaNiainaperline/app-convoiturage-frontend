import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getTrajet, reserverTrajet } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import { Trajet, ModePaiement } from '../../src/types';

interface ReservationForm {
  nbPlaces: number;
  modePaiement: ModePaiement;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function DetailTrajet() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [chargement, setChargement] = useState(true);
  const [reservation, setReservation] = useState<ReservationForm>({ nbPlaces: 1, modePaiement: 'especes' });
  const [reservant, setReservant] = useState(false);

  useEffect(() => {
    getTrajet(id)
      .then(res => setTrajet(res.data))
      .catch(() => Alert.alert('Erreur', 'Trajet introuvable.'))
      .finally(() => setChargement(false));
  }, [id]);

  const handleReserver = async () => {
    setReservant(true);
    try {
      await reserverTrajet({ trajetId: id, ...reservation });
      Alert.alert('Succès', 'Réservation envoyée ! Attendez la confirmation du conducteur.', [
        { text: 'OK', onPress: () => router.push('/(tabs)/reservations') }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Réservation échouée.');
    } finally {
      setReservant(false);
    }
  };

  if (chargement) return <ActivityIndicator size="large" color="#1E6B3C" style={{ flex: 1, marginTop: 100 }} />;
  if (!trajet) return null;

  const placesRestantes = trajet.placesDisponibles - trajet.placesReservees;
  const estConducteur = trajet.conducteur?._id === user?.id;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.retour}>
        <Text style={styles.retourTxt}>← Retour</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.villes}>{trajet.depart.ville}</Text>
        <Text style={styles.fleche}>→</Text>
        <Text style={styles.villes}>{trajet.arrivee.ville}</Text>
      </View>

      <View style={styles.section}>
        <InfoRow label="Date" value={new Date(trajet.dateDepart).toLocaleDateString('fr-FR')} />
        <InfoRow label="Heure" value={trajet.heureDepart} />
        <InfoRow label="Places restantes" value={`${placesRestantes}`} />
        <InfoRow label="Prix / place" value={`${trajet.prixParPlace.toLocaleString()} Ar`} />
        {trajet.description ? <InfoRow label="Note" value={trajet.description} /> : null}
      </View>

      {trajet.conducteur && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Conducteur</Text>
          <Text style={styles.conducteurNom}>{trajet.conducteur.prenom} {trajet.conducteur.nom}</Text>
          <Text style={styles.conducteurInfo}>⭐ {trajet.conducteur.note?.toFixed(1) ?? 'N/A'} · 📞 {trajet.conducteur.telephone}</Text>
          {trajet.conducteur.vehicule?.marque && (
            <Text style={styles.conducteurInfo}>
              🚗 {trajet.conducteur.vehicule.marque} {trajet.conducteur.vehicule.modele} · {trajet.conducteur.vehicule.couleur}
            </Text>
          )}
        </View>
      )}

      {!estConducteur && placesRestantes > 0 && trajet.statut === 'disponible' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitre}>Réserver</Text>

          <View style={styles.nbPlaces}>
            <TouchableOpacity onPress={() => setReservation(r => ({ ...r, nbPlaces: Math.max(1, r.nbPlaces - 1) }))} style={styles.btnQte}>
              <Text style={styles.btnQteTxt}>−</Text>
            </TouchableOpacity>
            <Text style={styles.nbPlacesTxt}>{reservation.nbPlaces} place(s)</Text>
            <TouchableOpacity onPress={() => setReservation(r => ({ ...r, nbPlaces: Math.min(placesRestantes, r.nbPlaces + 1) }))} style={styles.btnQte}>
              <Text style={styles.btnQteTxt}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Mode de paiement :</Text>
          <View style={styles.paiements}>
            {(['especes', 'mvola', 'orange_money'] as ModePaiement[]).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.paiementBtn, reservation.modePaiement === p && styles.paiementBtnActif]}
                onPress={() => setReservation(r => ({ ...r, modePaiement: p }))}
              >
                <Text style={[styles.paiementTxt, reservation.modePaiement === p && styles.paiementTxtActif]}>
                  {p === 'especes' ? 'Espèces' : p === 'mvola' ? 'MVola' : 'Orange Money'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.total}>Total : {(reservation.nbPlaces * trajet.prixParPlace).toLocaleString()} Ar</Text>

          <TouchableOpacity style={styles.boutonReserver} onPress={handleReserver} disabled={reservant}>
            {reservant ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonReserverTxt}>Réserver</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  retour: { padding: 16, paddingTop: 50 },
  retourTxt: { color: '#1E6B3C', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#fff', gap: 12 },
  villes: { fontSize: 22, fontWeight: 'bold', color: '#222' },
  fleche: { fontSize: 22, color: '#1E6B3C' },
  section: { backgroundColor: '#fff', margin: 12, borderRadius: 12, padding: 16 },
  sectionTitre: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { color: '#888', fontSize: 14 },
  infoValue: { color: '#222', fontWeight: '600', fontSize: 14 },
  conducteurNom: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  conducteurInfo: { color: '#666', fontSize: 13, marginBottom: 2 },
  nbPlaces: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 },
  btnQte: { backgroundColor: '#1E6B3C', borderRadius: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  btnQteTxt: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  nbPlacesTxt: { fontSize: 16, fontWeight: 'bold' },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  paiements: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  paiementBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  paiementBtnActif: { backgroundColor: '#1E6B3C', borderColor: '#1E6B3C' },
  paiementTxt: { color: '#666', fontSize: 12 },
  paiementTxtActif: { color: '#fff', fontWeight: 'bold' },
  total: { fontSize: 18, fontWeight: 'bold', color: '#1E6B3C', textAlign: 'center', marginBottom: 16 },
  boutonReserver: { backgroundColor: '#1E6B3C', padding: 16, borderRadius: 10, alignItems: 'center' },
  boutonReserverTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, RefreshControl, ListRenderItem } from 'react-native';
import { mesReservations, annulerReservation } from '../../src/services/api';
import { Reservation, StatutReservation } from '../../src/types';

const STATUT_COULEUR: Record<StatutReservation, string> = {
  en_attente: '#FFA500',
  confirme: '#1E6B3C',
  refuse: '#e74c3c',
  annule: '#999',
  termine: '#666',
};

const STATUT_LABEL: Record<StatutReservation, string> = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  refuse: 'Refusé',
  annule: 'Annulé',
  termine: 'Terminé',
};

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [chargement, setChargement] = useState(true);
  const [rafraichi, setRafraichi] = useState(false);

  const charger = async () => {
    try {
      const res = await mesReservations();
      setReservations(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
      setRafraichi(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const handleAnnuler = (id: string) => {
    Alert.alert('Annuler', "Confirmer l'annulation de la réservation ?", [
      { text: 'Non' },
      {
        text: 'Oui', style: 'destructive', onPress: async () => {
          await annulerReservation(id);
          charger();
        }
      }
    ]);
  };

  const renderItem: ListRenderItem<Reservation> = ({ item }) => (
    <View style={styles.carte}>
      <View style={styles.carteHeader}>
        <Text style={styles.villes}>
          {item.trajet?.depart?.ville} → {item.trajet?.arrivee?.ville}
        </Text>
        <View style={[styles.badge, { backgroundColor: STATUT_COULEUR[item.statut] }]}>
          <Text style={styles.badgeTxt}>{STATUT_LABEL[item.statut]}</Text>
        </View>
      </View>
      <Text style={styles.info}>📅 {item.trajet && new Date(item.trajet.dateDepart).toLocaleDateString('fr-FR')} à {item.trajet?.heureDepart}</Text>
      <Text style={styles.info}>💺 {item.nbPlaces} place(s) · 💵 {item.prixTotal?.toLocaleString()} Ar</Text>
      <Text style={styles.info}>💳 {item.modePaiement === 'especes' ? 'Espèces' : item.modePaiement === 'mvola' ? 'MVola' : 'Orange Money'}</Text>

      {item.statut === 'en_attente' && (
        <TouchableOpacity style={styles.btnAnnuler} onPress={() => handleAnnuler(item._id)}>
          <Text style={styles.btnAnnulerTxt}>Annuler</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Mes réservations</Text>
      {chargement ? (
        <ActivityIndicator size="large" color="#1E6B3C" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={rafraichi} onRefresh={() => { setRafraichi(true); charger(); }} colors={['#1E6B3C']} />}
          ListEmptyComponent={<Text style={styles.vide}>Aucune réservation.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#1E6B3C', paddingHorizontal: 16, marginBottom: 12 },
  carte: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, elevation: 2 },
  carteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  villes: { fontSize: 15, fontWeight: 'bold', color: '#222', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  info: { fontSize: 13, color: '#666', marginBottom: 3 },
  btnAnnuler: { marginTop: 10, borderWidth: 1, borderColor: '#e74c3c', borderRadius: 8, padding: 8, alignItems: 'center' },
  btnAnnulerTxt: { color: '#e74c3c', fontWeight: 'bold' },
  vide: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 16 },
});

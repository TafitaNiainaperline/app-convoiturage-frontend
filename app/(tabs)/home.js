import { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { getTrajets } from '../../src/services/api';

const VILLES = ['Antananarivo', 'Tamatave', 'Fianarantsoa', 'Majunga', 'Diego', 'Tuléar', 'Antsirabe'];

export default function Home() {
  const router = useRouter();
  const [trajets, setTrajets] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [rafraichi, setRafraichi] = useState(false);
  const [filtres, setFiltres] = useState({ depart: '', arrivee: '' });

  const chargerTrajets = async () => {
    try {
      const res = await getTrajets(filtres);
      setTrajets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
      setRafraichi(false);
    }
  };

  useEffect(() => { chargerTrajets(); }, []);

  const onRefresh = () => { setRafraichi(true); chargerTrajets(); };

  const renderTrajet = ({ item }) => (
    <TouchableOpacity style={styles.carte} onPress={() => router.push(`/trajet/${item._id}`)}>
      <View style={styles.carteHeader}>
        <Text style={styles.villes}>{item.depart.ville} → {item.arrivee.ville}</Text>
        <Text style={styles.prix}>{item.prixParPlace.toLocaleString()} Ar</Text>
      </View>
      <View style={styles.carteInfo}>
        <Text style={styles.info}>📅 {new Date(item.dateDepart).toLocaleDateString('fr-FR')} à {item.heureDepart}</Text>
        <Text style={styles.info}>💺 {item.placesDisponibles - item.placesReservees} place(s)</Text>
      </View>
      {item.conducteur && (
        <Text style={styles.conducteur}>
          🧑 {item.conducteur.prenom} {item.conducteur.nom} · ⭐ {item.conducteur.note?.toFixed(1) || 'N/A'}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Trouver un trajet</Text>

      {/* Filtres rapides */}
      <View style={styles.filtres}>
        <TextInput
          style={styles.filtreInput}
          placeholder="Départ (ex: Tana)"
          value={filtres.depart}
          onChangeText={v => setFiltres(f => ({ ...f, depart: v }))}
        />
        <TextInput
          style={styles.filtreInput}
          placeholder="Arrivée (ex: Tamatave)"
          value={filtres.arrivee}
          onChangeText={v => setFiltres(f => ({ ...f, arrivee: v }))}
        />
        <TouchableOpacity style={styles.btnRecherche} onPress={chargerTrajets}>
          <Text style={styles.btnRechercheTexte}>🔍</Text>
        </TouchableOpacity>
      </View>

      {chargement ? (
        <ActivityIndicator size="large" color="#1E6B3C" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={trajets}
          keyExtractor={item => item._id}
          renderItem={renderTrajet}
          refreshControl={<RefreshControl refreshing={rafraichi} onRefresh={onRefresh} colors={['#1E6B3C']} />}
          ListEmptyComponent={<Text style={styles.vide}>Aucun trajet disponible.</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50 },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#1E6B3C', paddingHorizontal: 16, marginBottom: 12 },
  filtres: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
  filtreInput: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#ddd' },
  btnRecherche: { backgroundColor: '#1E6B3C', borderRadius: 10, padding: 10, justifyContent: 'center' },
  btnRechercheTexte: { fontSize: 18 },
  carte: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14, elevation: 2 },
  carteHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  villes: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  prix: { fontSize: 16, fontWeight: 'bold', color: '#1E6B3C' },
  carteInfo: { flexDirection: 'row', gap: 16, marginBottom: 6 },
  info: { fontSize: 13, color: '#666' },
  conducteur: { fontSize: 13, color: '#888' },
  vide: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 16 },
});

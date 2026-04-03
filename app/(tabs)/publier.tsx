import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { creerTrajet } from '../../src/services/api';

const VILLES = ['Antananarivo', 'Tamatave', 'Fianarantsoa', 'Majunga', 'Diego-Suarez', 'Tuléar', 'Antsirabe', 'Ambositra'];

interface PublierForm {
  departVille: string;
  arriveeVille: string;
  dateDepart: string;
  heureDepart: string;
  placesDisponibles: string;
  prixParPlace: string;
  description: string;
}

export default function Publier() {
  const router = useRouter();
  const [form, setForm] = useState<PublierForm>({
    departVille: '',
    arriveeVille: '',
    dateDepart: '',
    heureDepart: '',
    placesDisponibles: '3',
    prixParPlace: '',
    description: '',
  });
  const [chargement, setChargement] = useState(false);

  const update = (key: keyof PublierForm, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handlePublier = async () => {
    const { departVille, arriveeVille, dateDepart, heureDepart, placesDisponibles, prixParPlace } = form;
    if (!departVille || !arriveeVille || !dateDepart || !heureDepart || !prixParPlace) {
      return Alert.alert('Erreur', 'Remplissez tous les champs obligatoires.');
    }
    setChargement(true);
    try {
      await creerTrajet({
        depart: { ville: departVille },
        arrivee: { ville: arriveeVille },
        dateDepart,
        heureDepart,
        placesDisponibles: parseInt(placesDisponibles),
        prixParPlace: parseInt(prixParPlace),
        description: form.description,
      });
      Alert.alert('Succès', 'Trajet publié !', [{ text: 'OK', onPress: () => router.push('/(tabs)/home') }]);
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Échec de la publication.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Publier un trajet</Text>

      <Text style={styles.label}>Ville de départ *</Text>
      <View style={styles.villesGrid}>
        {VILLES.map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.villeBtn, form.departVille === v && styles.villeBtnActif]}
            onPress={() => update('departVille', v)}
          >
            <Text style={[styles.villeTxt, form.departVille === v && styles.villeTxtActif]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Ville d'arrivée *</Text>
      <View style={styles.villesGrid}>
        {VILLES.map(v => (
          <TouchableOpacity
            key={v}
            style={[styles.villeBtn, form.arriveeVille === v && styles.villeBtnActif]}
            onPress={() => update('arriveeVille', v)}
          >
            <Text style={[styles.villeTxt, form.arriveeVille === v && styles.villeTxtActif]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
      <TextInput style={styles.input} placeholder="ex: 2025-08-15" value={form.dateDepart} onChangeText={v => update('dateDepart', v)} />

      <Text style={styles.label}>Heure de départ *</Text>
      <TextInput style={styles.input} placeholder="ex: 07:00" value={form.heureDepart} onChangeText={v => update('heureDepart', v)} />

      <Text style={styles.label}>Nombre de places *</Text>
      <View style={styles.nbPlaces}>
        {['1', '2', '3', '4', '5'].map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.nbBtn, form.placesDisponibles === n && styles.nbBtnActif]}
            onPress={() => update('placesDisponibles', n)}
          >
            <Text style={[styles.nbTxt, form.placesDisponibles === n && styles.nbTxtActif]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Prix par place (Ariary) *</Text>
      <TextInput style={styles.input} placeholder="ex: 15000" value={form.prixParPlace} onChangeText={v => update('prixParPlace', v)} keyboardType="numeric" />

      <Text style={styles.label}>Description (optionnel)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Infos utiles pour les passagers..."
        value={form.description}
        onChangeText={v => update('description', v)}
        multiline
      />

      <TouchableOpacity style={styles.bouton} onPress={handlePublier} disabled={chargement}>
        {chargement ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonTxt}>Publier le trajet</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  titre: { fontSize: 22, fontWeight: 'bold', color: '#1E6B3C', marginBottom: 20, paddingTop: 30 },
  label: { fontSize: 14, color: '#555', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16, marginBottom: 4 },
  villesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  villeBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  villeBtnActif: { backgroundColor: '#1E6B3C', borderColor: '#1E6B3C' },
  villeTxt: { color: '#555', fontSize: 13 },
  villeTxtActif: { color: '#fff', fontWeight: 'bold' },
  nbPlaces: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  nbBtn: { width: 44, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  nbBtnActif: { backgroundColor: '#1E6B3C', borderColor: '#1E6B3C' },
  nbTxt: { fontSize: 16, color: '#555' },
  nbTxtActif: { color: '#fff', fontWeight: 'bold' },
  bouton: { backgroundColor: '#1E6B3C', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  boutonTxt: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function Register() {
  const router = useRouter();
  const { inscrire } = useAuth();
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', motDePasse: '', role: 'passager' });
  const [chargement, setChargement] = useState(false);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const { nom, prenom, email, telephone, motDePasse } = form;
    if (!nom || !prenom || !email || !telephone || !motDePasse) {
      return Alert.alert('Erreur', 'Remplissez tous les champs.');
    }
    setChargement(true);
    try {
      await inscrire(form);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Inscription échouée.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titre}>Créer un compte</Text>

      <TextInput style={styles.input} placeholder="Nom" value={form.nom} onChangeText={v => update('nom', v)} />
      <TextInput style={styles.input} placeholder="Prénom" value={form.prenom} onChangeText={v => update('prenom', v)} />
      <TextInput style={styles.input} placeholder="Email" value={form.email} onChangeText={v => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Téléphone" value={form.telephone} onChangeText={v => update('telephone', v)} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Mot de passe" value={form.motDePasse} onChangeText={v => update('motDePasse', v)} secureTextEntry />

      <Text style={styles.label}>Je suis :</Text>
      <View style={styles.roles}>
        {['passager', 'conducteur', 'les_deux'].map(r => (
          <TouchableOpacity
            key={r}
            style={[styles.roleBtn, form.role === r && styles.roleBtnActif]}
            onPress={() => update('role', r)}
          >
            <Text style={[styles.roleTxt, form.role === r && styles.roleTxtActif]}>
              {r === 'passager' ? 'Passager' : r === 'conducteur' ? 'Conducteur' : 'Les deux'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.bouton} onPress={handleRegister} disabled={chargement}>
        {chargement ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonTexte}>S'inscrire</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.lien}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', flexGrow: 1, justifyContent: 'center' },
  titre: { fontSize: 24, fontWeight: 'bold', color: '#1E6B3C', textAlign: 'center', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 12, fontSize: 16 },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  roles: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  roleBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', alignItems: 'center' },
  roleBtnActif: { backgroundColor: '#1E6B3C', borderColor: '#1E6B3C' },
  roleTxt: { color: '#666', fontSize: 13 },
  roleTxtActif: { color: '#fff', fontWeight: 'bold' },
  bouton: { backgroundColor: '#1E6B3C', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  boutonTexte: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lien: { color: '#1E6B3C', textAlign: 'center', fontSize: 14 },
});

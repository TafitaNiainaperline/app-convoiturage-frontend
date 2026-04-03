import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { connecter } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleLogin = async () => {
    if (!email || !motDePasse) return Alert.alert('Erreur', 'Remplissez tous les champs.');
    setChargement(true);
    try {
      await connecter(email, motDePasse);
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Connexion échouée.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titre}>Covoiturage Mada</Text>
      <Text style={styles.sousTitre}>Connectez-vous</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={motDePasse}
        onChangeText={setMotDePasse}
        secureTextEntry
      />

      <TouchableOpacity style={styles.bouton} onPress={handleLogin} disabled={chargement}>
        {chargement ? <ActivityIndicator color="#fff" /> : <Text style={styles.boutonTexte}>Se connecter</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text style={styles.lien}>Pas encore de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  titre: { fontSize: 28, fontWeight: 'bold', color: '#1E6B3C', textAlign: 'center', marginBottom: 8 },
  sousTitre: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16 },
  bouton: { backgroundColor: '#1E6B3C', padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  boutonTexte: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  lien: { color: '#1E6B3C', textAlign: 'center', fontSize: 14 },
});

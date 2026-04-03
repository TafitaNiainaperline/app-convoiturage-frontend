import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, chargement } = useAuth();

  if (chargement) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E6B3C" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)/home' : '/auth/login'} />;
}

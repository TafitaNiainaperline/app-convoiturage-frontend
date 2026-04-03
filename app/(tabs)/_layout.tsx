import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ name }: { name: string }) {
  return <Text style={{ fontSize: 20 }}>{name}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1E6B3C',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Trajets', tabBarIcon: ({ color }) => <TabIcon name="🚗" /> }}
      />
      <Tabs.Screen
        name="publier"
        options={{ title: 'Publier', tabBarIcon: ({ color }) => <TabIcon name="➕" /> }}
      />
      <Tabs.Screen
        name="reservations"
        options={{ title: 'Mes trajets', tabBarIcon: ({ color }) => <TabIcon name="📋" /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <TabIcon name="👤" /> }}
      />
    </Tabs>
  );
}

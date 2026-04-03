import { Tabs } from 'expo-router';

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
        options={{ title: 'Trajets', tabBarIcon: ({ color }) => <TabIcon name="🚗" color={color} /> }}
      />
      <Tabs.Screen
        name="publier"
        options={{ title: 'Publier', tabBarIcon: ({ color }) => <TabIcon name="➕" color={color} /> }}
      />
      <Tabs.Screen
        name="reservations"
        options={{ title: 'Mes trajets', tabBarIcon: ({ color }) => <TabIcon name="📋" color={color} /> }}
      />
      <Tabs.Screen
        name="profil"
        options={{ title: 'Profil', tabBarIcon: ({ color }) => <TabIcon name="👤" color={color} /> }}
      />
    </Tabs>
  );
}

function TabIcon({ name }) {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 20 }}>{name}</Text>;
}

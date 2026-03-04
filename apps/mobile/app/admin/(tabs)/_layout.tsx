import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

const COLORS = { sage: '#748B75', sageDark: '#5A7A4E', muted: '#8A7A6E' };

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, color: focused ? COLORS.sageDark : COLORS.muted }}>
      {name === 'dashboard' && '📊'}
      {name === 'users' && '👥'}
      {name === 'fees' && '💰'}
      {name === 'payments' && '💳'}
      {name === 'more' && '⋯'}
    </Text>
  );
}

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.sageDark,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E0D6CC' },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="dashboard" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ focused }) => <TabIcon name="users" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: 'Fees',
          tabBarIcon: ({ focused }) => <TabIcon name="fees" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ focused }) => <TabIcon name="payments" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => <TabIcon name="more" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

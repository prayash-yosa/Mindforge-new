import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { sage: '#748B75', sageDark: '#5A7A4E', muted: '#8A7A6E', cream: '#F5FBEF', brown: '#503D42', border: '#E0D6CC' };

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconMap: Record<string, 'grid' | 'people' | 'wallet' | 'card' | 'ellipsis-horizontal'> = {
    dashboard: 'grid',
    users: 'people',
    fees: 'wallet',
    payments: 'card',
    more: 'ellipsis-horizontal',
  };
  return <Ionicons name={iconMap[name] ?? 'ellipsis-horizontal'} size={22} color={focused ? COLORS.sageDark : COLORS.muted} />;
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

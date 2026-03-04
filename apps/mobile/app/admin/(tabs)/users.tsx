import { View, Text, StyleSheet } from 'react-native';

const COLORS = { cream: '#F5FBEF', brown: '#503D42' };

export default function AdminUsersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users</Text>
      <Text style={styles.subtitle}>Approvals & account statuses</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.brown, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8A7A6E' },
});

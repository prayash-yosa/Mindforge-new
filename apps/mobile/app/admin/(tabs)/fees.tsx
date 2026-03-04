import { View, Text, StyleSheet } from 'react-native';

const COLORS = { cream: '#F5FBEF', brown: '#503D42' };

export default function AdminFeesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fees Configuration</Text>
      <Text style={styles.subtitle}>Grade fees & extra subject fees</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.brown, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8A7A6E' },
});

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const COLORS = { cream: '#F5FBEF', brown: '#503D42', sageDark: '#5A7A4E' };

export default function AdminMoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>More</Text>
      <TouchableOpacity style={styles.item} onPress={() => {}}>
        <Text style={styles.itemText}>Payment Info</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => {}}>
        <Text style={styles.itemText}>Audit Logs</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={() => router.replace('/')}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.brown, marginBottom: 20 },
  item: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E0D6CC' },
  itemText: { fontSize: 16, color: COLORS.brown },
  logout: { marginTop: 24, padding: 16, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E0D6CC' },
  logoutText: { fontSize: 16, color: COLORS.sageDark, fontWeight: '600', textAlign: 'center' },
});

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { cream: '#F5FBEF', brown: '#503D42', sageDark: '#5A7A4E', surface: '#FFFFFF', border: '#E0D6CC', muted: '#8A7A6E' };

const menuItems = [
  { label: 'Payment Info', icon: 'card-outline' as const, desc: 'QR codes & bank details' },
  { label: 'Audit Logs', icon: 'document-text-outline' as const, desc: 'Activity history' },
  { label: 'Grade Configs', icon: 'school-outline' as const, desc: 'Fee structure per grade' },
];

export default function AdminMoreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>More</Text>

        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={22} color={COLORS.sageDark} />
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => router.replace('/')} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.sageDark} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Mindforge v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.brown, marginBottom: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600', color: COLORS.brown },
  menuDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: { fontSize: 16, color: COLORS.sageDark, fontWeight: '600' },
  version: { textAlign: 'center', color: COLORS.muted, fontSize: 12, marginTop: 24 },
});

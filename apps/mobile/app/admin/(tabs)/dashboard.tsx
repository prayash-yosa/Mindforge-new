import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const COLORS = {
  sage: '#748B75',
  sageDark: '#5A7A4E',
  cream: '#F5FBEF',
  brown: '#503D42',
  surface: '#FFFFFF',
  border: '#E0D6CC',
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3004';

export default function AdminDashboardScreen() {
  const [kpis, setKpis] = useState<{ totalOutstanding?: number; paymentsThisMonth?: number } | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/v1/admin/fees/kpis`).then((r) => r.json()).then((d) => d.data).catch(() => null),
      fetch(`${API_BASE}/v1/admin/users/pending`).then((r) => r.json()).then((d) => d.data).catch(() => []),
    ]).then(([k, p]) => {
      setKpis(k ?? {});
      setPending(p ?? []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <>
          <View style={styles.cards}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Pending Approvals</Text>
              <Text style={styles.cardValue}>{pending.length}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Outstanding Fees</Text>
              <Text style={styles.cardValue}>₹{kpis?.totalOutstanding ?? 0}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Payments This Month</Text>
              <Text style={[styles.cardValue, { color: '#4CAF50' }]}>₹{kpis?.paymentsThisMonth ?? 0}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending User Approvals</Text>
            {pending.length === 0 ? (
              <Text style={styles.empty}>No pending approvals.</Text>
            ) : (
              pending.map((u: any, i: number) => (
                <View key={u.id ?? i} style={styles.row}>
                  <Text style={styles.rowText}>{u.username ?? u.role ?? 'User'}</Text>
                  <Text style={styles.rowMuted}>{u.role}</Text>
                </View>
              ))
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.brown },
  logout: { fontSize: 14, color: COLORS.sageDark, fontWeight: '500' },
  loading: { color: '#8A7A6E', textAlign: 'center', marginTop: 40 },
  cards: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLabel: { fontSize: 12, color: '#8A7A6E', marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700', color: COLORS.brown },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.brown, marginBottom: 12 },
  empty: { color: '#8A7A6E', fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 15, color: COLORS.brown },
  rowMuted: { fontSize: 13, color: '#8A7A6E' },
});

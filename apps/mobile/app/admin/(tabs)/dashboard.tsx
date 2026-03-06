import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useServer } from '../../../src/ServerContext';
import { PORTS } from '../../../src/config';

const COLORS = {
  sage: '#748B75',
  sageDark: '#5A7A4E',
  cream: '#F5FBEF',
  brown: '#503D42',
  surface: '#FFFFFF',
  border: '#E0D6CC',
  muted: '#8A7A6E',
};

export default function AdminDashboardScreen() {
  const { getApiUrl } = useServer();
  const API_BASE = getApiUrl(PORTS.admin);
  const [kpis, setKpis] = useState<{ totalOutstanding?: number; paymentsThisMonth?: number } | null>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = () => {
    Promise.all([
      fetch(`${API_BASE}/v1/admin/fees/grade-configs`).then((r) => r.json()).then((d) => d.data).catch(() => null),
      fetch(`${API_BASE}/v1/admin/users/pending`).then((r) => r.json()).then((d) => d.data).catch(() => []),
    ]).then(([feeData, p]) => {
      const configs = Array.isArray(feeData) ? feeData : [];
      const totalOutstanding = configs.reduce((s: number, c: any) => s + (c.totalFeeAmount ?? 0), 0);
      setKpis({ totalOutstanding, paymentsThisMonth: 0 });
      setPending(p ?? []);
    }).finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.sage} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <TouchableOpacity onPress={() => router.replace('/')}>
            <Text style={styles.logout}>Logout</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.sage} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.cardRow}>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Pending Approvals</Text>
                <Text style={styles.cardValue}>{pending.length}</Text>
              </View>
              <View style={styles.card}>
                <Text style={styles.cardLabel}>Outstanding Fees</Text>
                <Text style={styles.cardValue}>₹{kpis?.totalOutstanding ?? 0}</Text>
              </View>
            </View>
            <View style={styles.cardFull}>
              <Text style={styles.cardLabel}>Payments This Month</Text>
              <Text style={[styles.cardValue, { color: '#4CAF50' }]}>₹{kpis?.paymentsThisMonth ?? 0}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending User Approvals</Text>
              {pending.length === 0 ? (
                <Text style={styles.empty}>No pending approvals.</Text>
              ) : (
                pending.map((u: any, i: number) => (
                  <View key={u.id ?? i} style={[styles.row, i === pending.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={styles.rowText}>{u.username ?? u.role ?? 'User'}</Text>
                    <Text style={styles.rowMuted}>{u.role}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.cream },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.brown },
  logout: { fontSize: 14, color: COLORS.sageDark, fontWeight: '500' },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardFull: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  cardLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  cardValue: { fontSize: 20, fontWeight: '700', color: COLORS.brown },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.brown, marginBottom: 12 },
  empty: { color: COLORS.muted, fontSize: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowText: { fontSize: 15, color: COLORS.brown },
  rowMuted: { fontSize: 13, color: COLORS.muted },
});

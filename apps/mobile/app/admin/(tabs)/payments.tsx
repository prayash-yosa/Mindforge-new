import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useServer } from '../../../src/ServerContext';
import { PORTS } from '../../../src/config';

const COLORS = { cream: '#F5FBEF', brown: '#503D42', sageDark: '#5A7A4E', surface: '#FFFFFF', border: '#E0D6CC', muted: '#8A7A6E', sage: '#748B75' };

export default function AdminPaymentsScreen() {
  const { getApiUrl } = useServer();
  const API_BASE = getApiUrl(PORTS.admin);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = () => {
    fetch(`${API_BASE}/v1/admin/fees/kpis`)
      .then((r) => r.json())
      .then((d) => setKpis(d.data ?? d))
      .catch(() => setKpis(null))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchPayments(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchPayments(); };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.sage} />}
      >
        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subtitle}>Fee ledger & payment entry</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.sage} style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Total Collected</Text>
                <Text style={[styles.kpiValue, { color: '#4CAF50' }]}>
                  ₹{(kpis?.totalCollected ?? 0).toLocaleString()}
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>Outstanding</Text>
                <Text style={[styles.kpiValue, { color: '#E53935' }]}>
                  ₹{(kpis?.totalOutstanding ?? 0).toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Payment Recording</Text>
              <Text style={styles.infoText}>
                Record payments via the Admin API. Payment history for each student is available at /v1/admin/fees/payments/:studentId.
              </Text>
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
  title: { fontSize: 22, fontWeight: '700', color: COLORS.brown, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: 20 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiLabel: { fontSize: 12, color: COLORS.muted, marginBottom: 4 },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  infoCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoTitle: { fontSize: 16, fontWeight: '600', color: COLORS.brown, marginBottom: 8 },
  infoText: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
});

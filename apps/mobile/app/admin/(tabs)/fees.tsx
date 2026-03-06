import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { useServer } from '../../../src/ServerContext';
import { PORTS } from '../../../src/config';

const COLORS = { cream: '#F5FBEF', brown: '#503D42', sageDark: '#5A7A4E', surface: '#FFFFFF', border: '#E0D6CC', muted: '#8A7A6E', sage: '#748B75' };

export default function AdminFeesScreen() {
  const { getApiUrl } = useServer();
  const API_BASE = getApiUrl(PORTS.admin);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFees = () => {
    fetch(`${API_BASE}/v1/admin/fees/grade-configs`)
      .then((r) => r.json())
      .then((d) => setConfigs(Array.isArray(d.data) ? d.data : []))
      .catch(() => setConfigs([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchFees(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchFees(); };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.sage} />}
      >
        <Text style={styles.title}>Fees Configuration</Text>
        <Text style={styles.subtitle}>Grade fees & extra subject fees</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.sage} style={{ marginTop: 40 }} />
        ) : configs.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No fee configurations</Text>
            <Text style={styles.emptyText}>Grade fee configs will appear here once created via the API.</Text>
          </View>
        ) : (
          configs.map((c: any, i: number) => (
            <View key={c.id ?? i} style={styles.feeCard}>
              <View style={styles.feeHeader}>
                <Text style={styles.feeGrade}>Grade {c.grade}</Text>
                <Text style={styles.feeYear}>{c.academicYear}</Text>
              </View>
              <Text style={styles.feeAmount}>₹{(c.totalFeeAmount ?? 0).toLocaleString()}</Text>
              <Text style={styles.feeStatus}>{c.isActive ? 'Active' : 'Inactive'}</Text>
            </View>
          ))
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
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: COLORS.brown, marginBottom: 4 },
  emptyText: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  feeCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  feeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  feeGrade: { fontSize: 16, fontWeight: '600', color: COLORS.brown },
  feeYear: { fontSize: 13, color: COLORS.muted },
  feeAmount: { fontSize: 22, fontWeight: '700', color: COLORS.sageDark },
  feeStatus: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
});

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useServer } from '../../../src/ServerContext';
import { PORTS } from '../../../src/config';

const COLORS = { cream: '#F5FBEF', brown: '#503D42', sageDark: '#5A7A4E', surface: '#FFFFFF', border: '#E0D6CC', muted: '#8A7A6E', sage: '#748B75' };

export default function AdminUsersScreen() {
  const { getApiUrl } = useServer();
  const API_BASE = getApiUrl(PORTS.admin);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = () => {
    fetch(`${API_BASE}/v1/admin/users/pending`)
      .then((r) => r.json())
      .then((d) => setPending(Array.isArray(d.data) ? d.data : []))
      .catch(() => setPending([]))
      .finally(() => { setLoading(false); setRefreshing(false); });
  };

  useEffect(() => { fetchUsers(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchUsers(); };

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    fetch(`${API_BASE}/v1/admin/users/${id}/${action}`, { method: 'POST' })
      .then(() => fetchUsers())
      .catch(() => {});
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.sage} />}
      >
        <Text style={styles.title}>Users</Text>
        <Text style={styles.subtitle}>Approvals & account statuses</Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.sage} style={{ marginTop: 40 }} />
        ) : pending.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.sage} />
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>No pending approvals</Text>
          </View>
        ) : (
          pending.map((u: any, i: number) => (
            <View key={u.id ?? i} style={styles.userCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.username ?? 'User'}</Text>
                <Text style={styles.userRole}>{u.role} · {u.status ?? 'Pending'}</Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleAction(u.id, 'approve')}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleAction(u.id, 'reject')}>
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
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
  emptyBox: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.brown, marginTop: 12 },
  emptyText: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600', color: COLORS.brown },
  userRole: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  approveBtn: { backgroundColor: COLORS.sageDark, width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: '#E53935', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});

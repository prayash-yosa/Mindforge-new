import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useServer } from '../src/ServerContext';
import { PORTS } from '../src/config';

const C = { cream: '#F5FBEF', brown: '#503D42', sageDark: '#5A7A4E', surface: '#FFFFFF', border: '#E0D6CC', muted: '#8A7A6E', green: '#43A047', red: '#E53935' };

export default function ParentScreen() {
  const { getApiUrl } = useServer();
  const apiBase = getApiUrl(PORTS.parent);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    fetch(`${apiBase}/v1/health`, { signal: controller.signal })
      .then((r) => { clearTimeout(timer); setConnected(r.ok); })
      .catch(() => { clearTimeout(timer); setConnected(false); });
    return () => { clearTimeout(timer); controller.abort(); };
  }, [apiBase]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={C.sageDark} />
        </TouchableOpacity>
        <View style={s.topBarCenter}>
          <View style={[s.topIcon, { backgroundColor: '#F3ECF1' }]}>
            <Ionicons name="people" size={18} color="#8B5E83" />
          </View>
          <Text style={s.topTitle}>Parent</Text>
        </View>
        <View style={s.topBarRight}>
          <View style={[s.statusDot, { backgroundColor: connected === true ? C.green : connected === false ? C.red : C.muted }]} />
        </View>
      </View>

      <ScrollView style={s.content} contentContainerStyle={s.contentInner}>
        {connected === null && (
          <View style={s.statusCard}>
            <ActivityIndicator color={C.sageDark} />
            <Text style={s.statusText}>Connecting to Parent API...</Text>
          </View>
        )}
        {connected === false && (
          <View style={[s.statusCard, s.errorCard]}>
            <Ionicons name="cloud-offline-outline" size={24} color={C.red} />
            <Text style={s.errorTitle}>Backend not reachable</Text>
            <Text style={s.errorHint}>Start: cd apps/parent/backend && npm run start</Text>
            <Text style={s.errorUrl}>{apiBase}</Text>
          </View>
        )}
        {connected === true && (
          <>
            <Text style={s.sectionTitle}>Child Progress & Fees</Text>
            <View style={s.card}>
              <Ionicons name="trending-up-outline" size={20} color="#8B5E83" />
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>Parent Dashboard</Text>
                <Text style={s.cardDesc}>Child progress, attendance & fees from the Parent backend.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { padding: 6 },
  topBarCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 8 },
  topIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontWeight: '700', color: C.brown },
  topBarRight: { padding: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1 },
  contentInner: { padding: 20 },
  statusCard: { backgroundColor: C.surface, borderRadius: 12, padding: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border },
  errorCard: { borderColor: '#FFCDD2' },
  statusText: { fontSize: 14, color: C.muted },
  errorTitle: { fontSize: 16, fontWeight: '600', color: C.red },
  errorHint: { fontSize: 13, color: C.muted, textAlign: 'center' },
  errorUrl: { fontSize: 12, color: C.muted, fontFamily: 'monospace' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: C.brown, marginBottom: 14 },
  card: { backgroundColor: C.surface, borderRadius: 12, padding: 16, flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderWidth: 1, borderColor: C.border },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: C.brown, marginBottom: 2 },
  cardDesc: { fontSize: 13, color: C.muted, lineHeight: 19 },
});

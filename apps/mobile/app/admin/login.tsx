import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useServer } from '../../src/ServerContext';
import { PORTS } from '../../src/config';

const C = {
  sage: '#748B75',
  sageDark: '#5A7A4E',
  cream: '#F5FBEF',
  brown: '#503D42',
  surface: '#FFFFFF',
  border: '#E0D6CC',
  muted: '#8A7A6E',
  error: '#E53935',
};

export default function AdminLoginScreen() {
  const { getApiUrl } = useServer();
  const apiBase = getApiUrl(PORTS.admin);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Login failed');
      router.replace('/admin/(tabs)/dashboard');
    } catch (err: any) {
      const msg = err?.message || '';
      setError(
        msg.includes('Network') || msg.includes('fetch') || msg.includes('Failed')
          ? `Cannot reach Admin API at ${apiBase}. Check server settings.`
          : msg || 'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Demo login failed');
      router.replace('/admin/(tabs)/dashboard');
    } catch (err: any) {
      const msg = err?.message || '';
      setError(
        msg.includes('Network') || msg.includes('fetch') || msg.includes('Failed')
          ? `Cannot reach Admin API at ${apiBase}. Check server settings.`
          : msg || 'Demo login failed.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.keyboard}
      >
        <View style={s.topBar}>
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={C.sageDark} />
          </TouchableOpacity>
          <View style={s.topBarCenter}>
            <View style={s.topIcon}>
              <Ionicons name="shield-checkmark" size={18} color="#C17817" />
            </View>
            <Text style={s.topTitle}>Admin Portal</Text>
          </View>
          <View style={{ width: 34 }} />
        </View>

        <View style={s.content}>
          <Text style={s.title}>Sign in</Text>
          <Text style={s.subtitle}>Enter your admin credentials to continue</Text>

          <TextInput
            style={s.input}
            placeholder="Email"
            placeholderTextColor="#B0A8A0"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={s.input}
            placeholder="Password"
            placeholderTextColor="#B0A8A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {error && (
            <View style={s.errorRow}>
              <Ionicons name="alert-circle" size={16} color={C.error} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={s.btnPrimary}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnPrimaryText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.demoBtn}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Text style={s.demoBtnText}>Demo login</Text>
          </TouchableOpacity>

          <Text style={s.apiHint}>Server: {apiBase}</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },
  keyboard: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { padding: 6 },
  topBarCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 8 },
  topIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#FDF3E3', alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 18, fontWeight: '700', color: C.brown },
  content: { flex: 1, padding: 24, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: '700', color: C.sageDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: C.muted, marginBottom: 28 },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    marginBottom: 14,
    minHeight: 50,
    color: C.brown,
  },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 14 },
  errorText: { color: C.error, fontSize: 13, flex: 1, lineHeight: 18 },
  btnPrimary: {
    backgroundColor: C.sageDark,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    marginBottom: 12,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  demoBtn: { padding: 12, alignItems: 'center' },
  demoBtnText: { color: C.sageDark, fontSize: 14, fontWeight: '500' },
  apiHint: { textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 'auto', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});

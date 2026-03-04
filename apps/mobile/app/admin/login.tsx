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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

const COLORS = {
  sage: '#748B75',
  sageDark: '#5A7A4E',
  cream: '#F5FBEF',
  brown: '#503D42',
  surface: '#FFFFFF',
  border: '#E0D6CC',
  error: '#E53935',
};

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3004';

export default function AdminLoginScreen() {
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
      const res = await fetch(`${API_BASE}/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Login failed');
      // Store token (in production use SecureStore)
      // For now we just navigate - token would go in AsyncStorage/SecureStore
      router.replace('/admin/(tabs)/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/v1/admin/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Demo login failed');
      router.replace('/admin/(tabs)/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <TouchableOpacity
          style={styles.back}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8A7A6E"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8A7A6E"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.btn, styles.btnPrimary]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Sign in</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoLogin}
            disabled={loading}
          >
            <Text style={styles.demoBtnText}>Demo login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  keyboard: { flex: 1 },
  back: { padding: 16 },
  backText: { fontSize: 16, color: COLORS.sageDark, fontWeight: '500' },
  content: { flex: 1, padding: 24, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.sageDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#8A7A6E', marginBottom: 24 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 48,
  },
  error: { color: COLORS.error, fontSize: 14, marginBottom: 16 },
  btn: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: COLORS.sage, marginBottom: 12 },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  demoBtn: { padding: 12, alignItems: 'center' },
  demoBtnText: { color: COLORS.sageDark, fontSize: 14 },
});

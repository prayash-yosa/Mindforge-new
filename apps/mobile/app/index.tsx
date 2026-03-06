import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useServer } from '../src/ServerContext';

const { width } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_WIDTH = (width - 48 - CARD_GAP) / 2;

const C = {
  sage: '#748B75',
  sageDark: '#5A7A4E',
  sageLight: '#A3C4A5',
  cream: '#F5FBEF',
  brown: '#503D42',
  surface: '#FFFFFF',
  border: '#E0D6CC',
  muted: '#8A7A6E',
  red: '#E53935',
  green: '#43A047',
  amber: '#F9A825',
  overlay: 'rgba(80, 61, 66, 0.5)',
};

const ROLES = [
  {
    id: 'student',
    label: 'Student',
    desc: 'Activities, results & attendance',
    icon: 'school' as const,
    color: '#5A7A4E',
    bg: '#EDF7ED',
  },
  {
    id: 'teacher',
    label: 'Teacher',
    desc: 'Classes, syllabus & tests',
    icon: 'easel' as const,
    color: '#3F7CAC',
    bg: '#E8F1F8',
  },
  {
    id: 'parent',
    label: 'Parent',
    desc: 'Child progress & fees',
    icon: 'people' as const,
    color: '#8B5E83',
    bg: '#F3ECF1',
  },
  {
    id: 'admin',
    label: 'Admin',
    desc: 'Users, fees & payments',
    icon: 'shield-checkmark' as const,
    color: '#C17817',
    bg: '#FDF3E3',
  },
];

export default function RoleSelectScreen() {
  const { serverIp, isConnected, setServerIp, checkConnection } = useServer();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [ipDraft, setIpDraft] = useState(serverIp);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnims = useRef(ROLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const stagger = cardAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 200 + i * 100,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(80, stagger).start();
  }, []);

  useEffect(() => {
    setIpDraft(serverIp);
  }, [serverIp]);

  const handleSaveIp = async () => {
    if (ipDraft.trim()) {
      await setServerIp(ipDraft);
    }
    setSettingsOpen(false);
  };

  const statusColor =
    isConnected === true ? C.green : isConnected === false ? C.red : C.amber;
  const statusLabel =
    isConnected === true
      ? 'Connected'
      : isConnected === false
        ? 'Offline'
        : 'Checking...';

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.cream} />

      {/* ── Header ────────────────────────────────── */}
      <Animated.View
        style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        <View style={s.logoRow}>
          <View style={s.logoIcon}>
            <Ionicons name="cube" size={26} color="#fff" />
          </View>
          <View>
            <Text style={s.brand}>Mindforge</Text>
            <Text style={s.tagline}>Education Platform</Text>
          </View>
        </View>

        {/* ── Server Status Bar ───────────────────── */}
        <TouchableOpacity
          style={s.serverBar}
          onPress={() => setSettingsOpen(true)}
          activeOpacity={0.7}
        >
          <View style={s.serverLeft}>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            <Text style={s.serverLabel}>{statusLabel}</Text>
            <Text style={s.serverIp}>{serverIp}</Text>
          </View>
          <Ionicons name="settings-outline" size={18} color={C.muted} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Role Section ──────────────────────────── */}
      <View style={s.body}>
        <Animated.Text
          style={[s.sectionTitle, { opacity: fadeAnim }]}
        >
          Who are you?
        </Animated.Text>
        <Animated.Text style={[s.sectionHint, { opacity: fadeAnim }]}>
          Select your role to get started
        </Animated.Text>

        <View style={s.grid}>
          {ROLES.map((role, i) => (
            <Animated.View
              key={role.id}
              style={{
                opacity: cardAnims[i],
                transform: [
                  {
                    translateY: cardAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [24, 0],
                    }),
                  },
                  {
                    scale: cardAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.95, 1],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                style={[s.card, { width: CARD_WIDTH }]}
                onPress={() => router.push(`/${role.id}` as any)}
                activeOpacity={0.75}
              >
                <View style={[s.cardIcon, { backgroundColor: role.bg }]}>
                  <Ionicons name={role.icon} size={28} color={role.color} />
                </View>
                <Text style={s.cardTitle}>{role.label}</Text>
                <Text style={s.cardDesc}>{role.desc}</Text>
                <View style={[s.cardArrow, { backgroundColor: role.bg }]}>
                  <Ionicons name="arrow-forward" size={14} color={role.color} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* ── Footer ────────────────────────────────── */}
      <Animated.View style={[s.footer, { opacity: fadeAnim }]}>
        <Text style={s.version}>v1.0.0</Text>
      </Animated.View>

      {/* ── Settings Modal ────────────────────────── */}
      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={s.modalOverlay}
            activeOpacity={1}
            onPress={() => setSettingsOpen(false)}
          >
            <TouchableOpacity activeOpacity={1} style={s.modalCard}>
              <View style={s.modalHeader}>
                <Ionicons name="server-outline" size={24} color={C.sageDark} />
                <Text style={s.modalTitle}>Server Configuration</Text>
              </View>

              <Text style={s.modalLabel}>Server IP Address</Text>
              <Text style={s.modalHint}>
                Enter the IP of your local Mindforge server (e.g. 192.168.1.100)
              </Text>
              <TextInput
                style={s.modalInput}
                value={ipDraft}
                onChangeText={setIpDraft}
                placeholder="192.168.1.100"
                placeholderTextColor="#B0A8A0"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
                autoCorrect={false}
                selectTextOnFocus
              />

              <View style={s.statusRow}>
                <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[s.statusText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
                <TouchableOpacity onPress={checkConnection} style={s.retryBtn}>
                  {isConnected === null ? (
                    <ActivityIndicator size="small" color={C.sageDark} />
                  ) : (
                    <Ionicons name="refresh" size={16} color={C.sageDark} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={s.modalActions}>
                <TouchableOpacity
                  style={s.modalBtnSecondary}
                  onPress={() => {
                    setIpDraft(serverIp);
                    setSettingsOpen(false);
                  }}
                >
                  <Text style={s.modalBtnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.modalBtnPrimary} onPress={handleSaveIp}>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={s.modalBtnPrimaryText}>Save &amp; Connect</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.cream },

  /* Header */
  header: { paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 48 : 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  logoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: C.sageDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 26, fontWeight: '800', color: C.brown, letterSpacing: -0.5 },
  tagline: { fontSize: 13, color: C.muted, marginTop: -1 },

  /* Server Bar */
  serverBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  serverLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  serverLabel: { fontSize: 13, fontWeight: '600', color: C.brown },
  serverIp: { fontSize: 12, color: C.muted, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },

  /* Body */
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: C.brown, marginBottom: 4 },
  sectionHint: { fontSize: 14, color: C.muted, marginBottom: 24 },

  /* Grid */
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP },

  /* Card */
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    minHeight: 165,
    justifyContent: 'space-between',
  },
  cardIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: C.brown, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: C.muted, lineHeight: 17 },
  cardArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
  },

  /* Footer */
  footer: { alignItems: 'center', paddingBottom: 20 },
  version: { fontSize: 12, color: C.muted },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    width: width - 48,
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: C.brown },
  modalLabel: { fontSize: 14, fontWeight: '600', color: C.brown, marginBottom: 4 },
  modalHint: { fontSize: 12, color: C.muted, marginBottom: 12 },
  modalInput: {
    backgroundColor: C.cream,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: C.brown,
    marginBottom: 14,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  statusText: { fontSize: 13, fontWeight: '600' },
  retryBtn: { marginLeft: 'auto', padding: 6 },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalBtnSecondary: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  modalBtnSecondaryText: { fontSize: 15, fontWeight: '600', color: C.muted },
  modalBtnPrimary: {
    flex: 2,
    padding: 14,
    borderRadius: 10,
    backgroundColor: C.sageDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalBtnPrimaryText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

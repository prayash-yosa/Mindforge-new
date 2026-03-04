import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const COLORS = {
  sage: '#748B75',
  sageDark: '#5A7A4E',
  cream: '#F5FBEF',
  brown: '#503D42',
  surface: '#FFFFFF',
  border: '#E0D6CC',
};

export default function RoleSelectScreen() {
  const roles = [
    { id: 'admin', label: 'Admin', desc: 'Manage users, fees & payments' },
    { id: 'student', label: 'Student', desc: 'View activities & results' },
    { id: 'teacher', label: 'Teacher', desc: 'Classes, syllabus & tests' },
    { id: 'parent', label: 'Parent', desc: 'Child progress & fees' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Mindforge</Text>
        <Text style={styles.subtitle}>Who are you?</Text>
        <Text style={styles.hint}>Select your role to continue</Text>

        <View style={styles.roles}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              style={styles.card}
              onPress={() => router.push(`/${role.id}` as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.cardTitle}>{role.label}</Text>
              <Text style={styles.cardDesc}>{role.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.sageDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.brown,
    marginBottom: 4,
  },
  hint: {
    fontSize: 14,
    color: '#8A7A6E',
    marginBottom: 32,
  },
  roles: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 72,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.brown,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#8A7A6E',
  },
});

import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';

const COLORS = { cream: '#F5FBEF', brown: '#503D42', sageDark: '#5A7A4E' };

export default function ParentPlaceholderScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Parent</Text>
        <Text style={styles.subtitle}>Parent app coming soon.</Text>
        <Text style={styles.hint}>Child progress & fees will be available here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  back: { padding: 16 },
  backText: { fontSize: 16, color: COLORS.sageDark, fontWeight: '500' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.brown, marginBottom: 8 },
  subtitle: { fontSize: 18, color: COLORS.brown, marginBottom: 8 },
  hint: { fontSize: 14, color: '#8A7A6E' },
});

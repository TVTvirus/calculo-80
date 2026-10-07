import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { palette } from '@/constants/theme';

const links = [
  { title: 'Temas', description: 'Objetivos, subtemas y progreso', route: '/topics' },
  { title: 'Historial', description: 'Sesiones y registro manual', route: '/history' },
  { title: 'Simulacros', description: 'Exámenes de práctica', route: '/mocks' },
  { title: 'Configuración', description: 'Metas y fechas del plan', route: '/settings' },
] as const;

export default function MoreScreen() {
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Text style={styles.heading}>MÁS</Text>
    {links.map((link) => <Pressable key={link.title} accessibilityRole="button" style={styles.link} onPress={() => router.push(link.route)}>
      <Text style={styles.title}>{link.title}</Text><Text style={styles.description}>{link.description}</Text><Text style={styles.arrow}>→</Text>
    </Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, paddingTop: 34, gap: 12 },
  heading: { color: palette.text, fontSize: 30, fontWeight: '900', marginBottom: 12 },
  link: { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 20, padding: 20 },
  title: { color: palette.text, fontSize: 20, fontWeight: '800' },
  description: { color: palette.muted, marginTop: 5 },
  arrow: { color: palette.accent, position: 'absolute', right: 20, top: 25, fontSize: 22 },
});

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StudyProvider, useStudy } from '@/features/study/StudyContext';
import { palette } from '@/constants/theme';

function MilestoneNotice() {
  const { pendingMilestone, settings, acknowledgeMilestone, busy } = useStudy();
  return <Modal visible={pendingMilestone !== null} transparent animationType="fade" onRequestClose={() => { void acknowledgeMilestone(); }}>
    <View style={styles.backdrop}><View style={styles.card}>
      <Text style={styles.kicker}>HITO ALCANZADO</Text>
      <Text style={styles.number}>{pendingMilestone} HORAS</Text>
      <Text style={styles.detail}>{settings && pendingMilestone ? Math.round(pendingMilestone / settings.targetHours * 100) : 0}% del objetivo completado</Text>
      <Text style={styles.detail}>{pendingMilestone}:00:00 / {settings?.targetHours ?? 80}:00:00</Text>
      <View style={styles.button}><PrimaryButton label="CONTINUAR" disabled={busy} onPress={() => { void acknowledgeMilestone(); }} /></View>
    </View></View>
  </Modal>;
}

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return <StudyProvider>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.background, paddingTop: Math.ceil(insets.top / 2) } }}>
      <Stack.Screen name="(tabs)" options={{ contentStyle: { backgroundColor: palette.background } }} />
    </Stack>
    <MilestoneNotice />
  </StudyProvider>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000b', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: palette.surface, borderColor: palette.border, borderWidth: 1, borderRadius: 24, padding: 26, width: '100%', maxWidth: 380 },
  kicker: { color: palette.accent, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  number: { color: palette.text, fontSize: 42, fontWeight: '900', marginTop: 20, marginBottom: 10 },
  detail: { color: palette.muted, fontSize: 15, marginTop: 5 },
  button: { marginTop: 30 },
});

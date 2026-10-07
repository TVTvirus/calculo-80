import { Pressable, StyleSheet, Text } from 'react-native';
import { palette } from '@/constants/theme';

export function PrimaryButton({ label, onPress, disabled = false, secondary = false }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, (disabled || pressed) && styles.dimmed]}>
    <Text style={[styles.label, secondary && styles.secondaryLabel]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { backgroundColor: palette.accent, borderRadius: 18, minHeight: 58, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  secondary: { backgroundColor: palette.surfaceRaised, borderWidth: 1, borderColor: palette.border },
  dimmed: { opacity: 0.6 },
  label: { fontSize: 16, fontWeight: '800', color: palette.accentText, letterSpacing: 0.3 },
  secondaryLabel: { color: palette.text },
});

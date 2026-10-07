import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { palette } from '@/constants/theme';

export function StudyCard({ children }: PropsWithChildren) {
  return <View style={styles.card}>{children}</View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: palette.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: palette.border },
});

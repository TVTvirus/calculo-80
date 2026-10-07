import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: palette.surface, borderTopColor: palette.border, height: 68 + insets.bottom, paddingBottom: 10 + insets.bottom }, tabBarActiveTintColor: palette.accent, tabBarInactiveTintColor: palette.muted, tabBarLabelStyle: { fontSize: 12, fontWeight: '700' } }}>
    <Tabs.Screen name="index" options={{ title: 'Inicio', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>⌂</Text> }} />
    <Tabs.Screen name="plan" options={{ title: 'Plan', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 21 }}>◇</Text> }} />
    <Tabs.Screen name="timer" options={{ title: 'Timer', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>◷</Text> }} />
    <Tabs.Screen name="stats" options={{ title: 'Estadísticas', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>▥</Text> }} />
    <Tabs.Screen name="more" options={{ title: 'Más', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⋯</Text> }} />
  </Tabs>;
}

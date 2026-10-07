import type { Settings, StudyTopic } from '@/types/study';

export const DEFAULT_SETTINGS: Settings = {
  targetHours: 80,
  startDate: '2026-10-06',
  examDate: '2026-12-04',
  lastStudyDate: '2026-12-03',
  theme: 'dark',
  lastCelebratedMilestone: 0,
};

const CREATED_AT = '2026-10-06T00:00:00.000Z';
const topic = (id: string, name: string, hours: number, names: string[]): StudyTopic => ({
  id,
  name,
  targetMinutes: hours * 60,
  subtopics: names.map((subName, index) => ({ id: `${id}-${index + 1}`, name: subName })),
  createdAt: CREATED_AT,
});

export const DEFAULT_TOPICS: StudyTopic[] = [
  topic('limites', 'Límites', 14, ['Sustitución directa', 'Indeterminaciones', 'Factorización', 'Simplificación algebraica', 'Racionalización', 'Límites con raíces', 'Límites mixtos', 'Cuándo un límite no existe', 'Continuidad', 'Límites al infinito y asíntotas', 'Regla de L’Hôpital']),
  topic('derivadas', 'Derivadas', 18, ['Reglas básicas', 'Regla de la potencia', 'Producto', 'Cociente', 'Regla de la cadena', 'Exponenciales', 'Logaritmos', 'Trigonométricas', 'Funciones compuestas', 'Combinaciones largas de reglas', 'Derivación implícita', 'Extremos y monotonía', 'Concavidad e inflexión', 'Optimización y trazado de curvas']),
  topic('logaritmica', 'Derivación logarítmica', 8, ['Aplicar ln a ambos lados', 'Propiedades de logaritmos', 'Exponentes variables', 'Funciones elevadas a funciones', 'Despejar y′', 'Ejercicios mixtos']),
  topic('tangente', 'Recta tangente', 8, ['Evaluar f(a)', 'Obtener f′(x)', 'Calcular f′(a)', 'Pendiente', 'Ecuación punto-pendiente', 'Funciones con exponenciales', 'Rectas tangentes implícitas', 'Problemas completos']),
  topic('integrales', 'Integrales', 20, ['Antiderivadas básicas', 'Regla de potencia', 'Exponenciales', 'Trigonométricas', 'Sustitución', 'Detectar sustitución', 'Integración por partes', 'Productos x·trigonométrica', 'Integral definida y teorema fundamental', 'Área entre curvas', 'Fracciones parciales', 'Sustitución trigonométrica', 'Ejercicios mixtos']),
  topic('simulacros', 'Simulacros y corrección de errores', 12, ['Ejercicios mezclados', 'Exámenes cronometrados', 'Simulacros de 120 minutos', 'Revisión de errores', 'Repetir ejercicios fallados']),
];

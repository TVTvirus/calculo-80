export type StudyPhase = {
  number: number;
  startDate: string;
  endDate: string;
  rangeLabel: string;
  title: string;
  priorities: string[];
  note?: string;
};

export const STUDY_PHASES: StudyPhase[] = [
  {
    number: 1,
    startDate: '2026-10-06',
    endDate: '2026-10-18',
    rangeLabel: '6–18 OCT',
    title: 'Límites, de calentamiento a parcial',
    priorities: ['Límites directos y 0/0', 'Factorización y racionalización cuando hagan falta', 'Raíces, infinito y L’Hôpital'],
    note: 'Empezá con ejercicios sencillos de cálculo. Si el álgebra sale, avanzá; si traba, repasá solo esa técnica.',
  },
  {
    number: 2,
    startDate: '2026-10-19',
    endDate: '2026-11-01',
    rangeLabel: '19 OCT–1 NOV',
    title: 'Derivadas',
    priorities: ['Potencia, producto y cociente', 'Cadena y funciones compuestas', 'Trigonométricas, exponenciales y logaritmos', 'Derivación implícita y aplicaciones'],
  },
  {
    number: 3,
    startDate: '2026-11-02',
    endDate: '2026-11-12',
    rangeLabel: '2–12 NOV',
    title: 'Derivación logarítmica y recta tangente',
    priorities: ['Derivación logarítmica', 'Recta tangente explícita e implícita', 'Extremos, monotonía y concavidad'],
  },
  {
    number: 4,
    startDate: '2026-11-13',
    endDate: '2026-11-23',
    rangeLabel: '13–23 NOV',
    title: 'Integrales',
    priorities: ['Antiderivadas y sustitución', 'Integración por partes', 'Integral definida y área entre curvas', 'Ejercicios mixtos del nivel de los parciales'],
  },
  {
    number: 5,
    startDate: '2026-11-24',
    endDate: '2026-12-03',
    rangeLabel: '24 NOV–3 DIC',
    title: 'Simulacros y puntos débiles',
    priorities: ['Ejercicios mezclados', 'Simulacros de 120 minutos', 'Corrección y repetición de errores'],
    note: 'El 3 de diciembre es el último día normal de estudio. El examen es el 4 a las 8 a. m.',
  },
];

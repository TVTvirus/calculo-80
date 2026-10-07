export type PracticeStage = {
  id: string;
  phase: number;
  topicId: string;
  title: string;
  targetMinutes: number;
  focus: string;
  checkpoint: string;
  resourceTitle: string;
  resourceUrl: string;
};

const V1 = 'https://openstax.org/books/c%C3%A1lculo-volumen-1/pages/';
const V2 = 'https://openstax.org/books/c%C3%A1lculo-volumen-2/pages/';

export const PRACTICE_STAGES: PracticeStage[] = [
  { id: 'limits-start', phase: 1, topicId: 'limites', title: 'Volver a los límites', targetMinutes: 60, focus: 'Sustitución, 0/0 y primeras factorizaciones. El repaso algebraico se hace solo si un ejercicio lo pide.', checkpoint: 'Resolver un límite directo y uno 0/0 explicando por qué se puede cancelar.', resourceTitle: 'OpenStax: leyes de los límites', resourceUrl: `${V1}2-3-las-leyes-de-los-limites` },
  { id: 'limits-factor', phase: 1, topicId: 'limites', title: 'Factorización y cocientes', targetMinutes: 300, focus: 'Trinomios, diferencia de cuadrados y polinomios cúbicos, como en los parciales.', checkpoint: 'Resolver 4 de 5 límites racionales sin ayuda y justificar la cancelación.', resourceTitle: 'OpenStax: leyes de los límites', resourceUrl: `${V1}2-3-las-leyes-de-los-limites` },
  { id: 'limits-radical', phase: 1, topicId: 'limites', title: 'Raíces, infinito y existencia', targetMinutes: 300, focus: 'Racionalización, raíces cúbicas, límites al infinito y laterales con valor absoluto.', checkpoint: 'Distinguir cuándo el límite existe y resolver una raíz al infinito.', resourceTitle: 'OpenStax: límites al infinito', resourceUrl: `${V1}4-6-limites-al-infinito-y-asintotas` },
  { id: 'limits-hopital', phase: 1, topicId: 'limites', title: 'L’Hôpital y mezcla de técnicas', targetMinutes: 180, focus: 'Aplicar L’Hôpital solo en 0/0 o ∞/∞; elegir primero la técnica más corta.', checkpoint: 'Resolver límites mixtos con el número correcto de derivaciones.', resourceTitle: 'OpenStax: regla de L’Hôpital', resourceUrl: `${V1}4-8-la-regla-de-lhopital` },
  { id: 'deriv-rules', phase: 2, topicId: 'derivadas', title: 'Recuperar las reglas de derivación', targetMinutes: 180, focus: 'Potencia, producto, cociente y cadena, con práctica desde el primer bloque.', checkpoint: 'Derivar un producto y un cociente sin perder signos.', resourceTitle: 'OpenStax: reglas de diferenciación', resourceUrl: `${V1}3-3-reglas-de-diferenciacion` },
  { id: 'deriv-mixed', phase: 2, topicId: 'derivadas', title: 'Derivadas largas y compuestas', targetMinutes: 480, focus: 'Trigonométricas, logaritmos y exponenciales dentro de productos, cocientes y cadenas.', checkpoint: 'Derivar expresiones del tamaño del I parcial sin necesidad de simplificar.', resourceTitle: 'OpenStax: regla de la cadena', resourceUrl: `${V1}3-6-la-regla-de-la-cadena` },
  { id: 'deriv-apps', phase: 2, topicId: 'derivadas', title: 'Implícitas y aplicaciones', targetMinutes: 420, focus: 'Despejar y′; estudiar extremos, monotonía, concavidad e inflexión.', checkpoint: 'Justificar signos de f′ y f″, no solo listar puntos críticos.', resourceTitle: 'OpenStax: derivación implícita', resourceUrl: `${V1}3-8-diferenciacion-implicita` },
  { id: 'log-deriv', phase: 3, topicId: 'logaritmica', title: 'Derivación logarítmica', targetMinutes: 480, focus: 'Aplicar ln, usar propiedades y despejar y′ en potencias de funciones.', checkpoint: 'Resolver una función elevada a otra función sin saltar el paso de ln.', resourceTitle: 'OpenStax: derivadas logarítmicas', resourceUrl: `${V1}3-9-derivadas-de-funciones-exponenciales-y-logaritmicas` },
  { id: 'tangent', phase: 3, topicId: 'tangente', title: 'Rectas tangentes completas', targetMinutes: 480, focus: 'Hallar el punto, la pendiente y la recta; incluir curvas implícitas y exponenciales.', checkpoint: 'Escribir la ecuación final de la recta y comprobar que pasa por el punto.', resourceTitle: 'OpenStax: derivada y tangente', resourceUrl: `${V1}3-1-definir-la-derivada` },
  { id: 'integral-sub', phase: 4, topicId: 'integrales', title: 'Antiderivadas y sustitución', targetMinutes: 480, focus: 'Reglas básicas y reconocimiento de la función interna en integrales como las del III parcial.', checkpoint: 'Resolver integrales por sustitución y comprobar derivando el resultado.', resourceTitle: 'OpenStax: sustitución', resourceUrl: `${V1}5-5-sustitucion` },
  { id: 'integral-parts', phase: 4, topicId: 'integrales', title: 'Integración por partes', targetMinutes: 360, focus: 'Productos polinomio·trigonométrica y polinomio·ln, sin técnicas más avanzadas.', checkpoint: 'Elegir u y dv y comprobar el resultado por derivación.', resourceTitle: 'OpenStax: integración por partes', resourceUrl: `${V2}3-1-integracion-por-partes` },
  { id: 'integral-area', phase: 4, topicId: 'integrales', title: 'Integral definida y áreas', targetMinutes: 360, focus: 'Teorema fundamental y área entre curvas, dividiendo por puntos de cruce cuando haga falta.', checkpoint: 'Calcular un área con cambio de signo sin obtener un resultado negativo.', resourceTitle: 'OpenStax: integral definida', resourceUrl: `${V1}5-2-la-integral-definida` },
  { id: 'mock-review', phase: 5, topicId: 'simulacros', title: 'Simulacros y corrección', targetMinutes: 720, focus: 'Resolver exámenes de 120 minutos, clasificar errores y repetir problemas fallados.', checkpoint: 'Completar un simulacro dentro de 120 minutos y repetir los errores dos días después.', resourceTitle: 'Khan Academy: práctica de cálculo', resourceUrl: 'https://es.khanacademy.org/math/ap-calculus-ab' },
];

export function getStagesForPhase(phase: number): PracticeStage[] {
  return PRACTICE_STAGES.filter((stage) => stage.phase === phase);
}

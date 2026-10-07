export type ExerciseLevel = 'Arranque' | 'Práctica' | 'Nivel parcial';
export type WorkedExercise = {
  id: string;
  stageId: string;
  level: ExerciseLevel;
  prompt: string;
  answer: string;
  steps: string[];
};

const ex = (stageId: string, number: number, level: ExerciseLevel, prompt: string, answer: string, steps: string[]): WorkedExercise => ({ id: `${stageId}-${number}`, stageId, level, prompt, answer, steps });

// Enunciados originales. La dificultad máxima sigue los parciales MA0321 aportados por el usuario.
export const WORKED_EXERCISES: WorkedExercise[] = [
  ex('limits-start', 1, 'Arranque', 'Calculá limₓ→₂ (3x² − x + 1).', '11', ['Es un polinomio, así que se puede sustituir x = 2.', '3(2²) − 2 + 1 = 12 − 2 + 1 = 11.']),
  ex('limits-start', 2, 'Práctica', 'Calculá limₓ→₂ (x² − 4)/(x − 2).', '4', ['Al sustituir aparece 0/0; no es la respuesta.', 'x² − 4 = (x − 2)(x + 2).', 'Para x ≠ 2 se cancela x − 2; queda x + 2, cuyo límite es 4.']),
  ex('limits-start', 3, 'Nivel parcial', 'Calculá limₓ→₋₁ (x² + 3x + 2)/(x + 1).', '1', ['La sustitución da 0/0.', 'x² + 3x + 2 = (x + 1)(x + 2).', 'Cancelá x + 1 y evaluá x + 2 en −1: 1.']),

  ex('limits-factor', 1, 'Arranque', 'Calculá limₓ→₃ (x² − 9)/(x − 3).', '6', ['Factorizá x² − 9 = (x − 3)(x + 3).', 'Cancelá x − 3 para x ≠ 3.', 'Evaluá x + 3 en 3: 6.']),
  ex('limits-factor', 2, 'Práctica', 'Calculá limₓ→₋₂ (x² + 3x + 2)/(x² − 4).', '1/4', ['Factorizá arriba (x + 1)(x + 2) y abajo (x + 2)(x − 2).', 'Cancelá x + 2.', 'En x = −2 queda (−1)/(−4) = 1/4.']),
  ex('limits-factor', 3, 'Nivel parcial', 'Calculá limₓ→₃ (x³ − 3x² − 4x + 12)/(x² − 5x + 6).', '5', ['Agrupá el numerador: (x − 3)(x² − 4) = (x − 3)(x − 2)(x + 2).', 'El denominador es (x − 3)(x − 2).', 'Cancelá los factores comunes y evaluá x + 2 en 3: 5.']),

  ex('limits-radical', 1, 'Arranque', 'Calculá limₓ→₄ (√x − 2)/(x − 4).', '1/4', ['Multiplicá por el conjugado √x + 2.', 'Arriba queda x − 4; cancelalo con el denominador.', 'Evaluá 1/(√x + 2) en 4: 1/4.']),
  ex('limits-radical', 2, 'Práctica', 'Calculá limₓ→₂ |x − 2|/(x − 2), si existe.', 'No existe', ['Si x < 2, |x − 2| = −(x − 2), así que el límite izquierdo vale −1.', 'Si x > 2, el cociente vale 1.', 'Los límites laterales difieren: el límite bilateral no existe.']),
  ex('limits-radical', 3, 'Nivel parcial', 'Calculá limₓ→+∞ (√(x² + 2x) − x).', '1', ['Racionalizá: (√(x² + 2x) − x)(√(x² + 2x) + x) = 2x.', 'La expresión queda 2x/(√(x² + 2x) + x).', 'Dividí arriba y abajo por x > 0: 2/(√(1 + 2/x) + 1) → 1.']),

  ex('limits-hopital', 1, 'Arranque', 'Calculá limₓ→₀ sin x / x.', '1', ['Hay forma 0/0.', 'Por L’Hôpital, derivá numerador y denominador: cos x / 1.', 'Al evaluar x = 0 resulta 1.']),
  ex('limits-hopital', 2, 'Práctica', 'Calculá limₓ→₀ (eˣ − 1)/x.', '1', ['La forma es 0/0.', 'Por L’Hôpital queda eˣ/1.', 'En x = 0, e⁰ = 1.']),
  ex('limits-hopital', 3, 'Nivel parcial', 'Calculá limₓ→₀ (sin(2x) − 2x)/x³.', '−4/3', ['Primera aplicación: (2cos(2x) − 2)/(3x²), aún 0/0.', 'Segunda: −4sin(2x)/(6x), aún 0/0.', 'Tercera: −8cos(2x)/6 → −8/6 = −4/3.']),

  ex('deriv-rules', 1, 'Arranque', 'Derivá f(x) = x³ − 4x + 2.', 'f′(x) = 3x² − 4', ['Aplicá la regla de la potencia a x³.', 'La derivada de −4x es −4 y la constante desaparece.']),
  ex('deriv-rules', 2, 'Práctica', 'Derivá f(x) = √x + 1/x, con x > 0.', 'f′(x) = 1/(2√x) − 1/x²', ['Escribí √x = x^(1/2) y 1/x = x^(−1).', 'Derivá término a término con nx^(n−1).']),
  ex('deriv-rules', 3, 'Nivel parcial', 'Derivá f(x) = (x² + 1)(x³ − 2).', 'f′(x) = 2x(x³ − 2) + 3x²(x² + 1)', ['Usá la regla del producto: (uv)′ = u′v + uv′.', 'u′ = 2x y v′ = 3x². No hace falta expandir.']),

  ex('deriv-mixed', 1, 'Arranque', 'Derivá y = sen(3x²).', 'y′ = 6x cos(3x²)', ['La función externa es sen(u), cuya derivada es cos(u).', 'La interna u = 3x² tiene derivada 6x.', 'Multiplicá ambas por la regla de la cadena.']),
  ex('deriv-mixed', 2, 'Práctica', 'Derivá y = (e^(2x) + ln x)/(x² + 1), con x > 0.', 'y′ = [(2e^(2x) + 1/x)(x² + 1) − 2x(e^(2x) + ln x)]/(x² + 1)²', ['Usá el cociente: (u′v − uv′)/v².', 'u′ = 2e^(2x) + 1/x; v′ = 2x.', 'Sustituí sin necesidad de simplificar.']),
  ex('deriv-mixed', 3, 'Nivel parcial', 'Derivá y = tan((3x² − 2x)/(x⁴ + cos x)). No simplifiques.', 'y′ = sec²(u) · [(6x − 2)(x⁴ + cos x) − (3x² − 2x)(4x³ − sen x)]/(x⁴ + cos x)², con u = (3x² − 2x)/(x⁴ + cos x)', ['Primero aplicá la cadena: (tan u)′ = sec²(u)u′.', 'Para u usá el cociente.', 'Derivá el denominador como 4x³ − sen x y conservá los paréntesis.']),

  ex('deriv-apps', 1, 'Arranque', 'Derivá implícitamente x² + y² = 25.', 'y′ = −x/y (si y ≠ 0)', ['Derivá respecto a x: 2x + 2y·y′ = 0.', 'Despejá y′ = −2x/(2y) = −x/y.']),
  ex('deriv-apps', 2, 'Práctica', 'Para f(x) = x³ − 3x², indicá dónde crece y decrece.', 'Crece en (−∞, 0) y (2, ∞); decrece en (0, 2).', ['f′(x) = 3x² − 6x = 3x(x − 2).', 'Puntos críticos: x = 0 y x = 2.', 'El signo de f′ es +, −, + en los tres intervalos.']),
  ex('deriv-apps', 3, 'Nivel parcial', 'Para f(x) = x⁴ − 4x², hallá intervalos de concavidad y puntos de inflexión.', 'Cóncava arriba si |x| > √(2/3), abajo si |x| < √(2/3). Inflexiones en (±√(2/3), −20/9).', ['f″(x) = 12x² − 8; se anula en x = ±√(2/3).', 'f″ es positiva fuera de esos puntos y negativa entre ellos.', 'Como x² = 2/3, f(x) = 4/9 − 8/3 = −20/9.']),

  ex('log-deriv', 1, 'Arranque', 'Derivá y = xˣ para x > 0 usando ln.', 'y′ = xˣ(ln x + 1)', ['ln y = x ln x.', 'y′/y = ln x + 1 por producto.', 'Multiplicá por y = xˣ.']),
  ex('log-deriv', 2, 'Práctica', 'Derivá y = (x² + 1)ˣ.', 'y′ = (x² + 1)ˣ[ln(x² + 1) + 2x²/(x² + 1)]', ['ln y = x ln(x² + 1).', 'Derivá: y′/y = ln(x² + 1) + x·2x/(x² + 1).', 'Multiplicá por y.']),
  ex('log-deriv', 3, 'Nivel parcial', 'Derivá y = (x² + 2)^(sen(2x)).', 'y′ = (x² + 2)^(sen(2x))[2cos(2x)ln(x² + 2) + 2x sen(2x)/(x² + 2)]', ['ln y = sen(2x)ln(x² + 2).', 'Aplicá producto y cadena: y′/y = 2cos(2x)ln(x² + 2) + sen(2x)·2x/(x² + 2).', 'Multiplicá por y.']),

  ex('tangent', 1, 'Arranque', 'Hallá la recta tangente a y = x² en x = 2.', 'y = 4x − 4', ['El punto es (2, 4).', 'y′ = 2x, así que la pendiente en x = 2 es 4.', 'y − 4 = 4(x − 2); simplificá.']),
  ex('tangent', 2, 'Práctica', 'Hallá la recta tangente a y = eˣ + x² en x = 0.', 'y = x + 1', ['El punto es (0, 1).', 'y′ = eˣ + 2x; en 0 la pendiente es 1.', 'Usá y − 1 = 1(x − 0).']),
  ex('tangent', 3, 'Nivel parcial', 'Hallá la tangente a x² + xy + y² = 7 en (1, 2).', 'y − 2 = −(4/5)(x − 1)', ['El punto pertenece a la curva: 1 + 2 + 4 = 7.', 'Derivando: 2x + y + xy′ + 2yy′ = 0.', 'y′ = −(2x + y)/(x + 2y); en (1,2) vale −4/5.']),

  ex('integral-sub', 1, 'Arranque', 'Calculá ∫(3x² + 2x) dx.', 'x³ + x² + C', ['Integrá cada término: ∫3x² dx = x³ y ∫2x dx = x².', 'Comprobá derivando x³ + x².']),
  ex('integral-sub', 2, 'Práctica', 'Calculá ∫ 2x/(x² + 1)³ dx.', '−1/[2(x² + 1)²] + C', ['Tomá u = x² + 1, du = 2x dx.', 'Integrá ∫u⁻³ du = u⁻²/(−2).', 'Sustituí u de vuelta.']),
  ex('integral-sub', 3, 'Nivel parcial', 'Calculá ∫ eˣ/(3eˣ + 1)⁵ dx.', '−1/[12(3eˣ + 1)⁴] + C', ['Tomá u = 3eˣ + 1 y du = 3eˣ dx.', 'La integral es (1/3)∫u⁻⁵du.', 'Resultado: −u⁻⁴/12 + C.']),

  ex('integral-parts', 1, 'Arranque', 'Calculá ∫ x eˣ dx.', 'eˣ(x − 1) + C', ['Elegí u = x, dv = eˣ dx.', 'Entonces du = dx y v = eˣ.', '∫u dv = uv − ∫v du = xeˣ − eˣ + C.']),
  ex('integral-parts', 2, 'Práctica', 'Calculá ∫ x cos(2x) dx.', '(x/2)sen(2x) + (1/4)cos(2x) + C', ['Tomá u = x y dv = cos(2x) dx.', 'v = sen(2x)/2.', 'Queda x sen(2x)/2 − (1/2)∫sen(2x)dx; esa última integral da −cos(2x)/2.']),
  ex('integral-parts', 3, 'Nivel parcial', 'Calculá ∫ x² ln x dx, con x > 0.', '(x³/3)ln x − x³/9 + C', ['Tomá u = ln x y dv = x² dx.', 'Entonces du = dx/x y v = x³/3.', 'Por partes: (x³/3)ln x − (1/3)∫x²dx.']),

  ex('integral-area', 1, 'Arranque', 'Calculá ∫₀² x dx.', '2', ['Una primitiva es x²/2.', 'Evaluá [x²/2]₀² = 2 − 0 = 2.']),
  ex('integral-area', 2, 'Práctica', 'Hallá el área entre y = 2x e y = x², de x = 0 a x = 2.', '4/3', ['En (0,2), 2x está sobre x².', 'Área = ∫₀²(2x − x²)dx.', '[x² − x³/3]₀² = 4 − 8/3 = 4/3.']),
  ex('integral-area', 3, 'Nivel parcial', 'Hallá el área encerrada por f(x) = x³ − 3x y g(x) = x² − x.', '37/12', ['f − g = x(x − 2)(x + 1); se cruzan en −1, 0 y 2.', 'f − g es positiva en (−1,0) y negativa en (0,2).', 'Usá F(x) = x⁴/4 − x³/3 − x²: área = [F(0)−F(−1)] − [F(2)−F(0)] = 5/12 + 8/3 = 37/12.']),

  ex('mock-review', 1, 'Arranque', 'Mini repaso: limₓ→₁ (x² − 1)/(x − 1) y derivada de sen(x²).', 'Límite = 2; derivada = 2x cos(x²).', ['Factorizá x² − 1 = (x − 1)(x + 1).', 'Para la derivada usá cadena: externa cos(x²), interna 2x.']),
  ex('mock-review', 2, 'Práctica', 'Mini repaso: ∫ x sen x dx y tangente a y = x² + 1 en x = 1.', 'Integral = −x cos x + sen x + C; tangente: y = 2x.', ['Por partes, u = x, dv = sen x dx; v = −cos x.', 'La curva pasa por (1,2) y su derivada 2x da pendiente 2.', 'y − 2 = 2(x − 1).']),
  ex('mock-review', 3, 'Nivel parcial', 'Simulacro de 120 min, parte A: calculá limₓ→₂ (x³ − 4x)/(x² − 4) y derivá tan((x² + 1)/(x − 1)).', 'Límite = 2; derivada = sec²(u)·[(2x)(x − 1) − (x² + 1)]/(x − 1)², u = (x² + 1)/(x − 1).', ['Límite: x³ − 4x = x(x² − 4); cancelá x² − 4 y evaluá x = 2.', 'Derivada: cadena de tan y cociente para u.']),
  ex('mock-review', 4, 'Nivel parcial', 'Simulacro de 120 min, parte B: derivá y = (x² + 1)^(cos x) y hallá la tangente a y = eˣ + x en x = 0.', 'y′ = (x² + 1)^(cos x)[−sen x·ln(x² + 1) + 2x cos x/(x² + 1)]; tangente: y = 2x + 1.', ['Aplicá ln a la primera función, derivá el producto cos x·ln(x² + 1) y multiplicá por y.', 'Para la tangente: punto (0,1), derivada eˣ + 1 y pendiente 2.']),
  ex('mock-review', 5, 'Nivel parcial', 'Simulacro de 120 min, parte C: calculá ∫ eˣ/(eˣ + 2)³ dx y ∫ x cos x dx.', 'Primera: −1/[2(eˣ + 2)²] + C. Segunda: x sen x + cos x + C.', ['Primera: u = eˣ + 2, du = eˣ dx; integrá u⁻³.', 'Segunda: por partes con u = x y dv = cos x dx.']),
];

export function getExercisesForStage(stageId: string): WorkedExercise[] {
  return WORKED_EXERCISES.filter((exercise) => exercise.stageId === stageId);
}

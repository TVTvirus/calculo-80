# Cálculo 80

Aplicación personal de estudio para MA0321, hecha con React Native, Expo Router y TypeScript. Guarda los datos en el dispositivo mediante AsyncStorage. No usa cuenta, backend ni llamadas de red de la aplicación.

## Estado: fases A a D implementadas

- Inicio con progreso de 80 horas, tiempo de hoy, semana, restante, días y ritmo requerido.
- Seis temas iniciales y subtemas para elegir antes de empezar.
- Cronómetro con pausa, recuperación al reabrir y registro de segmentos activos, incluso al cruzar medianoche.
- Cierre de sesión con ejercicios, dificultad y nota opcionales.
- Recomendación diaria de tema, subtema y minutos, calculada con la fase, progreso pendiente, dificultad, precisión y práctica reciente.
- Pestaña Plan con el recorrido del 6 de octubre al 3 de diciembre.
- Trece bloques que distribuyen las 80 horas por tema, con una hora inicial de recuperación de límites.
- 41 ejercicios originales con respuestas y soluciones paso a paso, disponibles sin conexión.
- Opción de descartar un inicio accidental sin agregar horas.
- Temas con objetivos editables e historial por tema.
- Sesiones manuales, edición y eliminación desde Historial.
- Calendario, estadísticas, gráfica de progreso y proyección.
- Simulacros de 120 minutos con pausa, puntuación y temas fallados. Sus minutos cuentan una sola vez en el objetivo general.
- Hitos visuales cada diez horas.
- Sin sesiones de demostración.

La fecha confirmada por el usuario es el **4 de diciembre de 2026 a las 8 a. m.**. El último día de estudio es el **3 de diciembre**. Desde el 6 de octubre son **59 días**, con un ritmo inicial de **81,36 minutos diarios** para 80 horas.

Los objetivos por tema siguen los valores iniciales propuestos (14, 18, 8, 8, 20 y 12 horas) y se pueden ajustar en Configuración. El programa y exámenes de 2025 muestran además derivación implícita, extremos, monotonía, concavidad, optimización, L’Hôpital, integrales definidas/áreas, fracciones parciales y sustitución trigonométrica; esos contenidos se añadieron a los subtemas correspondientes.

## Ejecutar

```bash
npm install
npm start
```

El APK personal más reciente está en `builds/calculo-80-phase-d-r2.apk`; se instaló en un Nothing Phone (3). Los ejercicios y los datos funcionan sin servidor ni cuenta. Los enlaces opcionales a OpenStax y Khan Academy sí requieren internet. El APK personal está firmado con la clave de prueba local de Android. Hay una copia privada de esa clave en `~/.local/share/calculo-80/signing/installed-app.keystore`; conservarla permite actualizar esta instalación sin perder sus datos.

La variante de comunidad más reciente está en `builds/calculo-80-community-1.0.0-r5.apk`, con paquete `com.tvtvirus.calculo80.community` y firma de publicación propia. Se instaló junto a la versión personal para verificar una instalación limpia sin eliminar sus datos. La clave de esa variante se guarda fuera del repositorio en `~/.local/share/calculo-80/signing/`; hacer una copia segura antes de distribuir actualizaciones futuras. Las dos variantes tienen almacenamiento separado.

Para desarrollo con Expo Go, usar `npm start`. Para repetir el build local en esta computadora, ejecutar:

```bash
cd android
JAVA_HOME=/home/tvtvirus/.local/opt/temurin21 ANDROID_HOME=/home/tvtvirus/.local/share/android-sdk ./gradlew app:assembleRelease
```

## Verificar

```bash
npm run typecheck
npm run lint
npm run test
npx expo export --platform android
```

## Estructura

- `src/app`: pantallas y navegación.
- `types`: modelos persistidos.
- `constants`: datos iniciales y paleta.
- `storage`: acceso único a AsyncStorage por entidad.
- `services`: cálculos independientes de la interfaz.
- `features/timer`: transiciones del cronómetro.
- `features/study`: estado de la app.
- `components`, `hooks`, `utils`: interfaz y funciones compartidas.
- `tests`: pruebas de tiempo, progreso y cronómetro.

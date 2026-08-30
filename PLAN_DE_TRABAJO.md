# Plan de Trabajo

## Objetivo

Estabilizar la experiencia de lectura en movil y tablet, reducir los tiempos de carga y mantener el APK Android reproducible mediante Expo CNG. Cada fase termina con una validacion concreta antes de pasar a la siguiente.

## Fase 1: Base de calidad y compilacion

**Skills:** `react-native-expo`, `expo-react-native-typescript`

1. Mantener las dependencias alineadas mediante `npx expo install --check` y `npx expo-doctor`.
2. Conservar `android/` como salida generada; los cambios nativos se realizan desde `app.json` o config plugins.
3. Revisar el workflow de Android para ejecutar un prebuild limpio y compilar el APK antes de publicar.
4. Ejecutar `npm run check`, `npx expo-doctor` y una compilacion APK en CI.

**Salida:** Expo Doctor sin incidencias, TypeScript correcto y APK generado desde un checkout limpio.

## Fase 2: Contrato unico de layout

**Skills:** `expo-native-ui`, `react-native-architecture`, `react-native-patterns`

1. Definir un unico contrato para medidas del lienzo landscape y portrait en el nivel raiz.
2. Eliminar conversiones duplicadas entre `useWindowDimensions` y medidas de `onLayout` en biblioteca, selector de modo, narracion, grabacion y ajustes.
3. Sustituir posiciones absolutas de contenido centrado por layouts Flexbox cuando no sean necesarias.
4. Validar biblioteca, selector de modo, controles de lectura y puerta parental en telefono y tablet, portrait y landscape.

**Salida:** sin saltos de escala al montar una pantalla y controles centrados dentro del viewport visible.

## Fase 3: Flujos del lector y animaciones

**Skills:** `animating-react-native-expo`, `react-native`, `expo-native-ui`

1. Comparar cada transicion contra la especificacion visual y conservar solo las animaciones que aporten continuidad.
2. Usar Reanimated para transformaciones y opacidad que deban mantenerse fluidas; cancelar animaciones y temporizadores al desmontar.
3. Probar abrir, volver, leer, escuchar, grabar, bloquear y terminar un cuento sin duplicar overlays ni ejecuciones.
4. Revisar tiempos de auto-ocultado de controles y respuesta a rotacion de pantalla.

**Salida:** transiciones fluidas, una sola capa activa por estado y retorno consistente a la biblioteca.

## Fase 4: Rendimiento de biblioteca y contenido

**Skills:** `expo-react-native-performance`, `react-native-patterns`, `react-native-expo`

1. Medir la carga de catalogo y reemplazar las comprobaciones seriales de los 94 cuentos por concurrencia limitada o un manifiesto persistido.
2. Ajustar `FlatList` con limites de renderizado apropiados para la cuadrícula de tres columnas.
3. Verificar que las portadas y paginas no mantengan imagenes fuera de pantalla innecesariamente.
4. Mantener instalacion de ZIP atomica y mostrar errores recuperables si un cuento descargado esta corrupto.

**Salida:** biblioteca interactiva durante la carga y descargas recuperables sin perder cuentos instalados.

## Fase 5: Pruebas y entrega

**Skills:** `expo-react-native-typescript`, `react-native-architecture`, `react-native-expo`

1. Añadir pruebas de logica para la puerta parental, filtros, perfil y seleccion de modo.
2. Añadir una prueba de flujo para abrir un cuento y recorrer sus estados principales.
3. Mantener las validaciones de catalogo y JSX; ejecutarlas junto con TypeScript en CI.
4. Antes de cada release, ejecutar el build generado de Android y probar instalacion en el emulador.

**Salida:** cambios de UI y configuracion protegidos por validaciones automaticas y APK instalable.

## Orden de Ejecucion

1. Fase 1 para conservar una base reproducible.
2. Fase 2 antes de retocar pantallas individuales.
3. Fase 3 y Fase 4 en iteraciones pequenas con captura en emulador.
4. Fase 5 antes de la siguiente distribucion publica.
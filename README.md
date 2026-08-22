# Cuentos para Dormir

App de cuentos infantiles con audio de fondo y narración por página para Android. Lector de historias ilustradas con texto personalizado, música ambiental, y sistema de descarga de libros bajo demanda desde GitHub. Interfaz inspirada en el flujo y la identidad visual de la app original de Diveo Media (violeta/morado estrellado + CTA amarillo-naranja).

## Estado actual

### Implementado
- Splash screen reproduce un video del logo (`src/assets/logo_video.mp4`) con `expo-video`, luego navega a onboarding o biblioteca
- Onboarding completo de 9 pasos + pantalla de carga: idioma (solo español, seleccionable), "sin IA", protagonistas, nombre, género, preview personalizado, objetivos, preferencias (leer/escuchar/narrar), notificaciones, "preparando cuentos"
- Barra de estado oculta (barra de navegación de Android permanece visible, `expo-navigation-bar`)
- Biblioteca con grid de 3 columnas, portadas reales, buscador de texto y modal de filtros (no leídos, favoritos, con/sin narración, cortos/largos)
- Menú de tres puntos por cuento: marcar/desmarcar favorito, borrar libro descargado (bloqueado para libros integrados)
- Apertura de cuento con animación tipo "libro abriéndose" y selección de modo Leer / Escuchar
- Bloqueo de pantalla para niños al entrar a un cuento (mantener presionado 1.5s para desbloquear, ignora el botón físico de atrás mientras está bloqueado)
- Visor de cuento fullscreen con swipe horizontal + índice de páginas en miniatura (overlay tipo grid)
- Texto personalizado por página (reemplaza `{NAME:P1}` con el nombre del niño)
- Páginas diferenciadas por género (carpetas `boy/` y `girl/`)
- Audio de fondo del cuento con botón silenciar 🔊/🔇
- Narración por página con botón 🎧 (reproduce `voicework_es/voiceN.mp3`); en modo "Escuchar" se reproduce automáticamente al cambiar de página
- Duck de volumen: baja música de fondo automáticamente durante narración
- Botón mostrar/ocultar texto superpuesto (Aa)
- Controles auto-hide (aparecen al tocar, desaparecen a los 4s)
- Pantalla de "Fin" con créditos, "Leer otra vez", "Agregar a favoritos" y "Compartir"
- Keep-awake (pantalla no se apaga durante lectura)
- Sistema de descarga de libros desde GitHub con barra de progreso, y borrado desde el menú de la tarjeta
- Descompresión ZIP en el dispositivo (fflate)
- Persistencia de perfil, favoritos y libros leídos (AsyncStorage)
- Pantalla de ajustes (nombre, género, avatar, música on/off)
- Portadas bundleadas para todos los libros del catálogo
- Primer libro (ADayInReverse) se descarga automáticamente al primer arranque
- Orientación landscape siempre (bloqueada a nivel nativo)
- Expo Doctor: 21/21 checks pasando

### Pendiente / TODO
- [ ] Selector de idioma dentro de Ajustes (el onboarding ya tiene el paso, pero solo hay español disponible)
- [ ] Filtro "Incluye a N niños" (heroes) — requiere agregar ese dato al catálogo (`Book` type)
- [ ] Push notifications (Firebase Cloud Messaging) — removido por incompatibilidad con build limpio
- [ ] Grabación de narración propia ("Narrar cuentos") — omitido a propósito, no implementado
- [ ] Compras / suscripción — omitido a propósito (uso personal)
- [ ] Animaciones de entrada escalonada en la biblioteca
- [ ] Más libros (hay 92 en el catálogo original, 9 integrados actualmente)
- [ ] Tema claro/oscuro según hora del día

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Expo SDK | 57 | Framework base |
| React Native | 0.86.2 | UI nativa |
| React | 19.2.3 | Componentes |
| TypeScript | 6.0.3 | Tipado |
| expo-router | 57.x | Navegación file-based |
| expo-audio | 57.x | Música de fondo + narración por página |
| expo-file-system/legacy | 57.x | Lectura/escritura de archivos locales |
| fflate | 0.8.2 | Descompresión ZIP en JS |
| react-native-pager-view | 8.0.2 | Swipe horizontal de páginas |
| react-native-reanimated | 4.5.1 | Animaciones |
| AsyncStorage | 2.2.0 | Persistencia local |
| expo-keep-awake | 57.x | Evitar que la pantalla se apague |

## Estructura del proyecto

```
cuentos-app/
├── app/                          # Rutas (expo-router file-based)
│   ├── _layout.tsx               # Root layout, init audio + embedded books + nav bar visible
│   ├── index.tsx                 # Splash (video) → onboarding o library
│   ├── onboarding.tsx             # Primera vez: 9 pasos + pantalla de carga
│   ├── library.tsx               # Biblioteca principal (grid 3 columnas + búsqueda/filtros)
│   ├── book/[id].tsx             # Apertura de cuento + visor fullscreen
│   └── settings.tsx              # Ajustes de perfil
├── src/
│   ├── assets/
│   │   ├── books/                # Libro embebido + portadas + catálogo
│   │   ├── onboarding/            # Ilustraciones/íconos reales extraídos del APK original
│   │   ├── ui/                   # Íconos del lector (leer/escuchar, casa, música, índice...)
│   │   └── logo_video.mp4        # Video del splash
│   ├── components/
│   │   ├── BookCard.tsx          # Card 3-col con portada, favorito y menú de tres puntos
│   │   ├── BookCardMenu.tsx      # Menú: favorito / borrar libro descargado
│   │   ├── BookOpeningIntro.tsx  # Animación de apertura + selección Leer/Escuchar
│   │   ├── PageViewer.tsx        # Pager fullscreen + texto overlay
│   │   ├── PageIndexOverlay.tsx  # Índice de páginas en miniatura
│   │   ├── LockOverlay.tsx       # Bloqueo de pantalla para niños (mantener presionado)
│   │   ├── DownloadButton.tsx    # Botón con barra de progreso
│   │   ├── FilterModal.tsx       # Modal de filtros de biblioteca
│   │   ├── OnboardingHeader.tsx  # Flecha atrás + progreso segmentado + música (onboarding)
│   │   ├── GenderSelector.tsx    # Niño/niña cards con íconos reales
│   │   └── AnimalSelector.tsx    # Grid de animales avatar
│   ├── hooks/
│   │   ├── useBooks.ts           # Lista de libros + búsqueda + filtros + favoritos + borrado
│   │   ├── useBookPages.ts      # Páginas del libro (boy/girl/common)
│   │   ├── useBookTexts.ts      # Texto personalizado por página
│   │   ├── useVoicework.ts      # Narración por página (voicework_es/)
│   │   └── useProfile.ts        # Perfil del niño (AsyncStorage)
│   ├── screens/                  # Pantallas principales
│   ├── services/
│   │   ├── audioService.ts       # expo-audio: play/pause/stop/volume/duck
│   │   ├── downloadService.ts   # Descarga ZIP + extracción con fflate + borrado
│   │   └── embeddedBooksService.ts # Descarga del primer libro al arranque
│   ├── theme/colors.ts           # Paleta de colores (violeta/morado + amarillo-naranja)
│   └── types/book.ts            # Tipos TypeScript
├── books-zip/                    # ZIPs para descarga (en GitHub, excluido de EAS)
├── assets/                       # Íconos y splash
├── app.json                      # Config Expo (landscape, package name, status bar oculta)
├── eas.json                      # Config EAS Build
├── .easignore                    # Excluye books-zip del upload a EAS
└── .npmrc                        # legacy-peer-deps para install
```

## Estructura de un libro

```
{BookFolderName}/
├── Pages/
│   ├── boy/              # Imágenes cuando el perfil es niño
│   │   ├── page_001.webp
│   │   └── ...
│   ├── girl/             # Imágenes cuando el perfil es niña
│   └── common/           # Páginas compartidas (fallback)
├── {BookFolderName}.mp3  # Música de fondo
├── Texts.csv             # Textos multiidioma (TSV, columna ES)
├── AdditionalInfo.json   # Metadata: numberOfPages, imageType, resolution
└── voicework_es/         # Narración por página
    ├── VoiceworkInfo.json
    ├── voice0-name.mp3   # Pronunciación del nombre
    ├── voice1.mp3        # Narración página 1
    ├── voice2.mp3        # Narración página 2
    └── ...
```

### Texts.csv (formato TSV)
- Columnas: Key, EN, RU, DE, FR, IT, PT, **ES**, JA, ID, MS, AR
- Keys importantes: `title`, `author`, `illustrator`, `boy.page.1`, `boy.page.2`, `girl.page.1`...
- Placeholder `{NAME:P1}` → se reemplaza con el nombre del niño en el visor

## Flujo de la app

1. **Splash** (video del logo) → fade out
2. **Onboarding** (solo primera vez, 9 pasos): idioma → sin IA → protagonistas → nombre → género → preview → objetivos → preferencias → notificaciones → preparando cuentos
3. **Biblioteca**: grid 3 columnas con portadas, buscador y filtros. Los no descargados muestran botón "Descargar" con barra de progreso. Menú ⋮ por tarjeta para favorito/borrar
4. **Apertura de cuento**: animación de libro abriéndose + elegir Leer o Escuchar → pantalla se bloquea automáticamente (mantener presionado 1.5s para desbloquear)
5. **Visor**: fullscreen, swipe entre páginas, texto personalizado superpuesto
   - 📑 Índice de páginas en miniatura
   - 🎧 Escuchar narración de la página (automática en modo Escuchar)
   - Aa Mostrar/ocultar texto
   - 🔊/🔇 Silenciar música de fondo
   - 🔒 Bloquear pantalla de nuevo
   - ← Volver (detiene todo el audio)
6. **Fin del cuento**: créditos, "Leer otra vez", "Agregar a favoritos", "Compartir", "Volver a la biblioteca"
7. **Ajustes**: cambiar nombre, género, avatar, música on/off

## Comandos

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Verificar salud del proyecto
npx expo-doctor

# Compilar TypeScript (verificar errores)
npx tsc --noEmit

# Bundle local (verificar que Metro funciona)
npx expo export --platform android --output-dir dist

# Build local de APK release en macOS/Linux (prebuild + gradlew assembleRelease)
npm run build:local

# Build local de APK release en Windows (PowerShell, mismo resultado que build:local)
npm run build:local:win

# Build APK en la nube (EAS), perfil preview
npm run build:apk

# Build AAB en la nube (EAS), perfil production (para Google Play)
npm run build:android

# Build APK en la nube en background, sin esperar (EAS)
npm run build:eas

# Compila el APK local y lo sube al servidor configurado en scripts/deploy-apk.sh
npm run deploy:apk

# Desarrollo local (requiere dispositivo conectado)
npx expo start
```

> `build:local` / `build:local:win` requieren Android SDK + JDK instalados localmente. La primera compilación tarda bastante (Gradle descarga su distribución + compila módulos nativos como `react-native-worklets`); builds siguientes son mucho más rápidos gracias al cache de Gradle.

## Sistema de descarga de libros

Los libros se almacenan como ZIP en este mismo repo en `books-zip/`. La app descarga desde:
```
https://github.com/adrendon/cuentos-para-dormir/raw/main/books-zip/{FolderName}.zip
```

El `.easignore` excluye `books-zip/` del upload a EAS Build (solo sube ~23MB de código + assets).

Para generar nuevos ZIPs:
```bash
cd /ruta/a/books/originales
for book in NombreLibro1 NombreLibro2; do
  zip -r "books-zip/${book}.zip" "$book/" -x "*.DS_Store"
done
```

## Notas técnicas

- **Node.js 22** requerido (24+ incompatible con expo-modules-core)
- **expo-file-system/legacy** — SDK 57 tiene nueva API, usamos legacy import
- **expo-audio** reemplaza a expo-av (deprecado en SDK 57)
- **expo-video** para reproducir el logo del splash
- **react-native-track-player removido** — incompatible con EAS build limpio
- **Package name**: `com.cuentos.dormir`
- **Android target**: API 27+ (Android 8.1+)
- **Orientación**: landscape siempre (configurado en app.json)
- **Barra de estado**: oculta globalmente (`androidStatusBar.hidden` + `expo-status-bar`); la barra de navegación de Android se fuerza visible con `expo-navigation-bar` para no interferir con la navegación del sistema
- En Windows, `build:local:win` fuerza `-Djavax.net.ssl.trustStoreType=Windows-ROOT` para evitar errores de certificado SSL al descargar la distribución de Gradle en redes corporativas con inspección SSL

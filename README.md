# Cuentos para Dormir

App de cuentos infantiles con audio de fondo y narración por página para Android. Lector de historias ilustradas con texto personalizado, música ambiental, y sistema de descarga de libros bajo demanda desde GitHub.

## Estado actual

### Implementado
- Splash screen con transición fade
- Onboarding (nombre, género niño/niña, avatar animal) — solo primera vez
- Biblioteca con grid de 3 columnas, portadas reales y filtros (todos / favoritos / no leídos)
- Visor de cuento fullscreen en portrait con swipe horizontal
- Texto personalizado por página (reemplaza `{NAME:P1}` con el nombre del niño)
- Páginas diferenciadas por género (carpetas `boy/` y `girl/`)
- Audio de fondo del cuento con botón silenciar 🔊/🔇
- Narración por página con botón 🎧 (reproduce `voicework_es/voiceN.mp3`)
- Duck de volumen: baja música de fondo automáticamente durante narración
- Botón mostrar/ocultar texto superpuesto (Aa)
- Controles auto-hide (aparecen al tocar, desaparecen a los 4s)
- Pantalla de "Fin" con créditos al llegar a la última página
- Keep-awake (pantalla no se apaga durante lectura)
- Sistema de descarga de libros desde GitHub con barra de progreso
- Descompresión ZIP en el dispositivo (fflate)
- Persistencia de perfil, favoritos y libros leídos (AsyncStorage)
- Pantalla de ajustes (nombre, género, avatar, música on/off)
- Portadas bundleadas para todos los libros del catálogo
- Primer libro (ADayInReverse) se descarga automáticamente al primer arranque
- Orientación portrait siempre (bloqueada a nivel nativo)
- Expo Doctor: 21/21 checks pasando

### Pendiente / TODO
- [ ] Push notifications (Firebase Cloud Messaging) — removido por incompatibilidad con build limpio
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
│   ├── _layout.tsx               # Root layout, init audio + embedded books
│   ├── index.tsx                 # Splash → onboarding o library
│   ├── onboarding.tsx            # Primera vez: nombre, género, avatar
│   ├── library.tsx               # Biblioteca principal (grid 3 columnas)
│   ├── book/[id].tsx             # Visor de cuento fullscreen
│   └── settings.tsx              # Ajustes de perfil
├── src/
│   ├── assets/books/             # Libro embebido + portadas
│   │   ├── ADayInReverse/        # Libro completo (se descarga al primer arranque)
│   │   ├── covers/               # Portadas de los 9 libros (1.4MB)
│   │   ├── catalog.json          # Catálogo: metadata, coverColor, embedded flag
│   │   ├── bookAssets.ts         # API del catálogo
│   │   └── coverRegistry.ts     # require() estáticos de portadas
│   ├── components/
│   │   ├── BookCard.tsx          # Card 3-col con portada + botón descarga
│   │   ├── PageViewer.tsx        # Pager fullscreen + texto overlay
│   │   ├── DownloadButton.tsx    # Botón con barra de progreso
│   │   ├── FilterBar.tsx         # Chips: todos/favoritos/no leídos
│   │   ├── GenderSelector.tsx    # Niño/niña cards
│   │   └── AnimalSelector.tsx    # Grid de animales avatar
│   ├── hooks/
│   │   ├── useBooks.ts           # Lista de libros + estado descarga
│   │   ├── useBookPages.ts      # Páginas del libro (boy/girl/common)
│   │   ├── useBookTexts.ts      # Texto personalizado por página
│   │   ├── useVoicework.ts      # Narración por página (voicework_es/)
│   │   └── useProfile.ts        # Perfil del niño (AsyncStorage)
│   ├── screens/                  # Pantallas principales
│   ├── services/
│   │   ├── audioService.ts       # expo-audio: play/pause/stop/volume/duck
│   │   ├── downloadService.ts   # Descarga ZIP + extracción con fflate
│   │   └── embeddedBooksService.ts # Descarga del primer libro al arranque
│   ├── theme/colors.ts           # Paleta de colores
│   └── types/book.ts            # Tipos TypeScript
├── books-zip/                    # ZIPs para descarga (en GitHub, excluido de EAS)
├── assets/                       # Íconos y splash
├── app.json                      # Config Expo (portrait, package name)
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

1. **Splash** (2.5s) → fade out
2. **Onboarding** (solo primera vez): nombre → género → avatar
3. **Biblioteca**: grid 3 columnas con portadas. Los no descargados muestran botón "Descargar" con barra de progreso
4. **Visor**: fullscreen portrait, swipe entre páginas, texto personalizado superpuesto
   - 🎧 Escuchar narración de la página
   - Aa Mostrar/ocultar texto
   - 🔊/🔇 Silenciar música de fondo
   - ← Volver (detiene todo el audio)
5. **Ajustes**: cambiar nombre, género, avatar, música on/off

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

# Build APK en la nube (EAS)
EAS_SKIP_AUTO_FINGERPRINT=1 eas build --platform android --profile preview --non-interactive --no-wait

# Desarrollo local (requiere dispositivo conectado)
npx expo start
```

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
- **react-native-track-player removido** — incompatible con EAS build limpio
- **Package name**: `com.cuentos.dormir`
- **Android target**: API 27+ (Android 8.1+)
- **Orientación**: portrait siempre (configurado en app.json)

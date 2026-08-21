# Cuentos para Dormir

App de cuentos infantiles con audio de fondo para Android. Lector de historias ilustradas con texto personalizado, música ambiental y sistema de descarga de libros bajo demanda.

## Estado actual

### Implementado
- Splash screen con transición fade
- Onboarding (nombre, género niño/niña, avatar animal)
- Biblioteca con grid de portadas y filtros (todos / favoritos / no leídos)
- Visor de cuento fullscreen en portrait con swipe horizontal
- Texto personalizado por página (reemplaza `{NAME:P1}` con el nombre del niño)
- Páginas diferenciadas por género (carpetas `boy/` y `girl/`)
- Audio de fondo del cuento con botón silenciar/activar
- Botón mostrar/ocultar texto superpuesto
- Controles auto-hide (aparecen al tocar, desaparecen a los 4s)
- Pantalla de "Fin" con créditos al llegar a la última página
- Keep-awake (pantalla no se apaga durante lectura)
- Sistema de descarga de libros desde GitHub con barra de progreso
- Persistencia de perfil, favoritos y libros leídos (AsyncStorage)
- Pantalla de ajustes (nombre, género, avatar, música on/off)
- Expo Doctor: 21/21 checks pasando

### Pendiente / TODO
- [ ] Push notifications (Firebase Cloud Messaging) — removido temporalmente por incompatibilidad con build limpio
- [ ] Audio de narración por página (`voicework_es/`) — los archivos existen pero no se reproducen aún
- [ ] Foreground service para audio con pantalla bloqueada (requiere `react-native-track-player` que fue reemplazado por `expo-audio`)
- [ ] Subir los ZIPs de los libros a GitHub para que la descarga funcione
- [ ] Más libros (hay 92 en el catálogo original, 9 integrados actualmente)
- [ ] Animaciones de entrada escalonada en la biblioteca
- [ ] Tema claro/oscuro según hora del día

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Expo SDK | 57 | Framework base |
| React Native | 0.86.2 | UI nativa |
| React | 19.2.3 | Componentes |
| TypeScript | 6.0.3 | Tipado |
| expo-router | 57.x | Navegación file-based |
| expo-audio | 57.x | Reproducción de música de fondo |
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
│   ├── library.tsx               # Biblioteca principal (grid de cuentos)
│   ├── book/[id].tsx             # Visor de cuento
│   └── settings.tsx              # Ajustes de perfil
├── src/
│   ├── assets/books/             # Libro embebido + portadas
│   │   ├── ADayInReverse/        # Libro completo embebido (24MB)
│   │   ├── covers/               # Portadas de los 9 libros (1.4MB)
│   │   ├── catalog.json          # Catálogo con metadata y coverColor
│   │   ├── bookAssets.ts         # API del catálogo
│   │   └── coverRegistry.ts     # require() estáticos de portadas
│   ├── components/
│   │   ├── BookCard.tsx          # Card del grid con portada + descarga
│   │   ├── PageViewer.tsx        # Pager fullscreen + texto overlay
│   │   ├── DownloadButton.tsx    # Botón con barra de progreso
│   │   ├── FilterBar.tsx         # Chips: todos/favoritos/no leídos
│   │   ├── GenderSelector.tsx    # Niño/niña cards
│   │   └── AnimalSelector.tsx    # Grid de animales avatar
│   ├── hooks/
│   │   ├── useBooks.ts           # Lista de libros + estado descarga
│   │   ├── useBookPages.ts      # Páginas del libro actual
│   │   ├── useBookTexts.ts      # Texto personalizado por página
│   │   └── useProfile.ts        # Perfil del niño (AsyncStorage)
│   ├── screens/                  # Pantallas principales
│   ├── services/
│   │   ├── audioService.ts       # expo-audio: play/pause/stop/volume
│   │   ├── downloadService.ts   # Descarga ZIP + extracción con fflate
│   │   ├── embeddedBooksService.ts # Setup primer arranque
│   │   └── notificationService.ts # FCM (deshabilitado)
│   ├── theme/colors.ts           # Paleta de colores
│   └── types/book.ts            # Tipos TypeScript
├── books-zip/                    # ZIPs para descarga (excluido de EAS)
├── assets/                       # Íconos y splash
├── app.json                      # Config Expo
├── eas.json                      # Config EAS Build
├── .easignore                    # Excluye books-zip del upload a EAS
└── .npmrc                        # legacy-peer-deps para install
```

## Estructura de un libro

Cada cuento es una carpeta con:

```
{BookFolderName}/
├── Pages/
│   ├── boy/          # Imágenes para niño
│   │   ├── page_001.webp
│   │   ├── page_002.webp
│   │   └── ...
│   ├── girl/         # Imágenes para niña
│   └── common/       # Páginas compartidas
├── {BookFolderName}.mp3    # Música de fondo
├── Texts.csv               # Textos en múltiples idiomas (TSV)
├── AdditionalInfo.json     # Metadata: numberOfPages, imageType, etc.
└── voicework_es/           # (Opcional) narración por página
    ├── VoiceworkInfo.json
    ├── voice0-name.mp3
    ├── voice1.mp3
    └── ...
```

### Texts.csv (formato TSV)
- Columnas: Key, EN, RU, DE, FR, IT, PT, **ES**, JA, ID, MS, AR
- Keys: `title`, `author`, `illustrator`, `boy.description`, `boy.page.1`, `boy.page.2`, etc.
- Placeholder `{NAME:P1}` se reemplaza con el nombre del niño

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

# Build APK en la nube
EAS_SKIP_AUTO_FINGERPRINT=1 eas build --platform android --profile preview --non-interactive

# Desarrollo local (requiere emulador o dispositivo)
npx expo start
```

## Generar ZIPs de libros

Los libros se descargan como ZIP desde GitHub. Para generar los ZIPs:

```bash
cd /ruta/a/books/originales
for book in ADayInReverse AFunWalk AGoodIdea ...; do
  zip -r "books-zip/${book}.zip" "$book/" -x "*.DS_Store"
done
```

Los ZIPs se guardan en `books-zip/` y se pushean a GitHub. La app los descarga desde:
```
https://github.com/adrendon/cuentos-para-dormir/raw/main/books-zip/{FolderName}.zip
```

## Flujo de la app

1. **Splash** (2.5s) → fade out
2. **Onboarding** (solo primera vez): nombre → género → avatar → biblioteca
3. **Biblioteca**: grid 2 columnas, portadas, filtros. Libros no descargados muestran botón "Descargar"
4. **Visor**: fullscreen portrait, swipe, texto personalizado, audio de fondo, controles al tocar
5. **Ajustes**: cambiar nombre, género, avatar, música on/off

## Notas importantes

- **Node.js 22** requerido (no usar 24+ por incompatibilidad con expo-modules-core)
- **expo-file-system/legacy** — SDK 57 tiene nueva API de filesystem, usamos el import legacy para compatibilidad
- **`.easignore`** excluye `books-zip/` y `dist/` del upload a EAS (reduce de 312MB a 23MB)
- **`expo-av` deprecado** — reemplazado por `expo-audio` en SDK 57
- **`react-native-track-player` removido** — no compatible con build limpio de EAS, usar expo-audio
- **Package name**: `com.cuentos.dormir`
- **Android target**: API 27+ (Android 8.1+)

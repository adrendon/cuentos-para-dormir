# Cuentos para Dormir

App de cuentos infantiles personalizados con audio, narración por página, y sistema de descarga bajo demanda. Los niños son los protagonistas de cada historia, con su nombre integrado en el texto y páginas ilustradas según su género.

## Flujo completo de la app

```
Splash (video logo_video.mp4, fondo #004B80, portrait)
  ↓ fade-out
Onboarding (portrait, 9 pasos + pantalla de carga)
  1. Idioma (solo español)
  2. Sin inteligencia artificial
  3. Tus hijos son los protagonistas
  4. Nombre del niño
  5. Género (niño/niña)
  6. Preview personalizado ("¡A {nombre} le va a encantar!")
  7. ¿Qué es lo que buscas? (multi-select)
  8. ¿Qué prefieres? (Leer/Escuchar/Narrar)
  9. Permitir notificaciones (permiso real Android)
  → Pantalla de carga "Preparando cuentos" (5s, barra progreso)
  ↓
Biblioteca (landscape, grid 3 columnas)
  ├── Buscar (input crema, X para borrar)
  ├── Filtro modal (chips coloreados: púrpura/cyan/naranja)
  ├── Configuración (slide from bottom)
  │   ├── Nombre + Género
  │   ├── Oso (izquierda) + Zorro (derecha)
  │   ├── Globo idioma + Música toggle
  │   └── Continuar (guarda y vuelve)
  ├── Descargar cuento (progreso circular SVG)
  └── Abrir cuento
      ↓ animación 3D book-flip
    Selector de modo (Leer / Escuchar / Grabar)
      ├── Leer → Reader con música de fondo
      ├── Escuchar → Panel narraciones + auto-narrar por página
      └── Grabar → "Próximamente"
      ↓
    Reader (landscape, fullscreen)
      ├── Imagen de página (cover, fullscreen)
      ├── Texto personalizado ({NAME} reemplazado)
      ├── Flechas ← → (pressed state)
      ├── Barra inferior de thumbnails (2-col index disponible)
      ├── Controles superiores (auto-hide 4s):
      │   ├── Casa (volver con animación close)
      │   ├── Página X/Total
      │   ├── Menú hamburguesa (slide from right):
      │   │   ├── Tamaño texto (A- / A+)
      │   │   ├── Índice de páginas
      │   │   └── Reportar
      │   ├── Narrar (toggle voicework)
      │   ├── Texto Aa (show/hide)
      │   ├── Música (toggle + slider volumen)
      │   └── Bloquear (lock infantil)
      ├── Slider volumen música (amarillo, aparece con toggle)
      ├── Slider volumen narración (cyan, aparece en modo Escuchar)
      └── Pantalla Fin (Leer otra vez / Favoritos / Compartir)
```

## Diseño visual

### Paleta de colores

| Uso | Hex |
|---|---|
| Splash background | `#004B80` |
| App background | `#03032A` |
| Title yellow | `#FFC000` |
| Orange | `#FF8024` |
| Light blue / accent | `#27C8FF` |
| Tooltip/input background | `#EFEFE0` |
| Input text | `#606371` |
| Onboarding subtitle | `#B5B7F8` |
| Chip green | `#0CAC47` |
| Chip purple | `#8E4BF2` |
| Chip blue | `#29B7DF` |
| Chip orange | `#FB8200` |
| Filter indicator | `#2CACEB` |
| CTA gradient | `#E5B840` → `#F1893C` |
| Blue gradient | `#36C0ED` → `#2E80ED` |
| Green gradient | `#1BBF68` → `#088E67` |

### Fuentes

- **BalooBhaijaan** — títulos redondeados
- **Montserrat SemiBold** — cuerpo de texto
- **Montserrat ExtraBold** — botones y headings

### Animaciones y transiciones

| Transición | Tipo |
|---|---|
| Splash → siguiente | fade-out 400ms |
| Onboarding entre pasos | slide horizontal (translateX) + opacity crossfade |
| Biblioteca → Settings | slide from bottom |
| Settings → Biblioteca | slide to bottom |
| Biblioteca → Libro | 3D book-flip (rotateY + perspective + scale) |
| Libro → Biblioteca | scale-down 0.85 + fade-out 400ms |
| Controles del reader | opacity 250ms in / 200ms out |
| Menú hamburguesa | slide from right + dark overlay |
| Filtro modal | fade + centered |
| Audio | fadeInVolume 1000ms / fadeOutVolume 500ms |
| Flechas | pressed state (imagen alternativa) |
| Cards biblioteca | staggered fade-in + scale (80ms delay por card) |
| Scroll-to-top | fade-in/out |
| Descarga | progreso circular SVG |

## Stack técnico

| Tecnología | Versión | Uso |
|---|---|---|
| Expo SDK | 57 | Framework |
| React Native | 0.86.2 | UI nativa |
| React | 19.2.3 | Componentes |
| TypeScript | 6.0.3 | Tipado |
| expo-router | 57.x | Navegación file-based |
| expo-audio | 57.x | Música + narración |
| expo-video | 57.x | Splash video |
| expo-file-system/legacy | 57.x | Filesystem |
| expo-notifications | 57.x | Permiso push |
| expo-navigation-bar | 57.x | Immersive mode |
| expo-screen-orientation | 57.x | Portrait/Landscape per-screen |
| expo-keep-awake | 57.x | Pantalla activa |
| fflate | 0.8.2 | Unzip |
| react-native-reanimated | 4.5.1 | Animaciones 60fps |
| react-native-pager-view | 8.0.2 | Swipe páginas |
| react-native-svg | latest | Progreso circular descarga |
| @react-native-community/slider | 5.2.x | Sliders volumen |
| @react-native-async-storage | 2.2.0 | Persistencia |

## Estructura

```
app/                          # Rutas (expo-router)
  _layout.tsx                 # Root: fonts, audio, nav-bar hidden, splash
  index.tsx                   # → SplashScreen
  onboarding.tsx              # → OnboardingScreen
  library.tsx                 # → LibraryScreen
  book/[id].tsx               # → BookScreen
  settings.tsx                # → SettingsScreen (slide_from_bottom)
src/
  assets/
    books/                    # 1 libro embebido + 9 portadas + catálogo
    onboarding/               # 30 assets del onboarding
    settings/                 # bear.webp + fox.webp
    ui/                       # 35+ iconos de interfaz
    fonts/                    # BalooBhaijaan + Montserrat
    logo_video.mp4            # Splash video (9s)
  components/
    BookCard.tsx              # Card tipo libro con spine + ribbon + MB
    BookCardMenu.tsx          # Menú 3 puntos (favorito/eliminar)
    BookOpeningIntro.tsx      # Animación 3D flip + selector modo
    DownloadButton.tsx        # Progreso circular SVG
    FilterModal.tsx           # Modal filtros con chips coloreados
    GenderSelector.tsx        # Niño/niña con iconos on/off
    LockOverlay.tsx           # Bloqueo infantil
    NarrationPanel.tsx        # Panel narradores profesionales/personales
    OnboardingHeader.tsx      # Barra progreso pencil + step counter
    PageIndexOverlay.tsx      # Grid 2-col thumbnails + ribbon
    PageViewer.tsx            # Pager fullscreen + arrows pressed
    ReaderMenu.tsx            # Hamburguesa: texto, índice, reportar
  hooks/
    useBookPages.ts           # Carga páginas boy/girl/common
    useBooks.ts               # Catálogo + descarga + filtros + búsqueda
    useBookTexts.ts           # Texto personalizado {NAME}
    useProfile.ts             # AsyncStorage perfil
    useReaderLock.ts          # Lock infantil
    useVoicework.ts           # Narración por página
    useVoiceworkProfile.ts    # Narrator info del JSON
  screens/
    SplashScreen.tsx          # Video + fade + orientación
    OnboardingScreen.tsx      # 9 pasos + loading (712 líneas)
    LibraryScreen.tsx         # Grid 3-col + búsqueda + filtros
    BookScreen.tsx            # Reader completo (559 líneas)
    SettingsScreen.tsx        # Config con oso+zorro
  services/
    audioService.ts           # expo-audio: play/stop/fade/duck/loop
    downloadService.ts        # GitHub ZIP + fflate unzip
    embeddedBooksService.ts   # Primer libro al arranque
    notificationService.ts    # FCM placeholder
  theme/colors.ts             # Paleta de colores
  types/book.ts               # Tipos completos
books-zip/                    # ZIPs para descarga (excluido de EAS)
```

## Descarga de libros

Los libros se descargan como ZIP desde GitHub:
```
https://github.com/adrendon/cuentos-para-dormir/raw/main/books-zip/{FolderName}.zip
```

9 libros disponibles: ADayInReverse (embebido), AFunWalk, AGoodIdea, AGreatFriendship, ALittleAntsBigJob, AllIsNotLost, APerfectHome, Belka, BirdsChoir.

## Comandos

```bash
npm install --legacy-peer-deps    # Instalar dependencias
npx expo-doctor                   # Verificar salud (21/21)
npx tsc --noEmit                  # TypeScript check
npm run build:eas                 # Build APK en la nube (EAS)
npm run deploy:apk                # Build local + subir al servidor Oracle
```

## Notas

- **Node.js 22** requerido (24+ incompatible)
- **expo-file-system/legacy** para API clásica en SDK 57
- **Orientación**: portrait para splash/onboarding, landscape para biblioteca/libro/settings
- **Package name**: `com.cuentos.dormir`
- **Navigation bar** oculta (immersive mode)
- **Audio**: loop infinito, volume slider, fade in/out, duck durante narración
- **Grabación**: placeholder "Próximamente" (infraestructura lista)

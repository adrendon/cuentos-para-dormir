# Cuentos para Dormir

App de cuentos infantiles personalizados con audio, narración por página, y sistema de descarga bajo demanda. Los niños son los protagonistas de cada historia, con su nombre integrado en el texto y páginas ilustradas según su género.

## Flujo completo de la app

```
Splash (video lumio-splash.mp4, fondo #004B80, portrait)
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

| Uso                      | Hex                   |
| ------------------------ | --------------------- |
| Splash background        | `#004B80`             |
| App background           | `#03032A`             |
| Title yellow             | `#FFC000`             |
| Orange                   | `#FF8024`             |
| Light blue / accent      | `#27C8FF`             |
| Tooltip/input background | `#EFEFE0`             |
| Input text               | `#606371`             |
| Onboarding subtitle      | `#B5B7F8`             |
| Chip green               | `#0CAC47`             |
| Chip purple              | `#8E4BF2`             |
| Chip blue                | `#29B7DF`             |
| Chip orange              | `#FB8200`             |
| Filter indicator         | `#2CACEB`             |
| CTA gradient             | `#E5B840` → `#F1893C` |
| Blue gradient            | `#36C0ED` → `#2E80ED` |
| Green gradient           | `#1BBF68` → `#088E67` |

### Fuentes

- **BalooBhaijaan** — títulos redondeados
- **Montserrat SemiBold** — cuerpo de texto
- **Montserrat ExtraBold** — botones y headings

### Animaciones y transiciones

| Transición             | Tipo                                              |
| ---------------------- | ------------------------------------------------- |
| Splash → siguiente     | fade-out 400ms                                    |
| Onboarding entre pasos | slide horizontal (translateX) + opacity crossfade |
| Biblioteca → Settings  | slide from bottom                                 |
| Settings → Biblioteca  | slide to bottom                                   |
| Biblioteca → Libro     | 3D book-flip (rotateY + perspective + scale)      |
| Libro → Biblioteca     | scale-down 0.85 + fade-out 400ms                  |
| Controles del reader   | opacity 250ms in / 200ms out                      |
| Menú hamburguesa       | slide from right + dark overlay                   |
| Filtro modal           | fade + centered                                   |
| Audio                  | fadeInVolume 1000ms / fadeOutVolume 500ms         |
| Flechas                | pressed state (imagen alternativa)                |
| Cards biblioteca       | staggered fade-in + scale (80ms delay por card)   |
| Scroll-to-top          | fade-in/out                                       |
| Descarga               | progreso circular SVG                             |

## Stack técnico

| Tecnología                     | Versión | Uso                                                       |
| ------------------------------ | ------- | --------------------------------------------------------- |
| Expo SDK                       | 57      | Framework                                                 |
| React Native                   | 0.86.2  | UI nativa                                                 |
| React                          | 19.2.3  | Componentes                                               |
| TypeScript                     | 6.0.3   | Tipado                                                    |
| expo-router                    | 57.x    | Navegación file-based                                     |
| expo-audio                     | 57.x    | Música + narración                                        |
| expo-video                     | 57.x    | Splash video                                              |
| expo-file-system/legacy        | 57.x    | Filesystem                                                |
| expo-notifications             | 57.x    | Permiso push                                              |
| expo-navigation-bar            | 57.x    | Immersive mode                                            |
| expo-screen-orientation        | 57.x    | Portrait/Landscape per-screen                             |
| expo-keep-awake                | 57.x    | Pantalla activa                                           |
| react-native-zip-archive       | 8.x     | Extracción ZIP nativa sin cargar el archivo en memoria JS |
| react-native-reanimated        | 4.5.1   | Animaciones 60fps                                         |
| react-native-pager-view        | 8.0.2   | Swipe páginas                                             |
| react-native-svg               | latest  | Progreso circular descarga                                |
| @react-native-community/slider | 5.2.x   | Sliders volumen                                           |
| @react-native-async-storage    | 2.2.0   | Persistencia                                              |

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
    lumio-splash.mp4          # Splash video (9s)
  components/
    BookCard.tsx              # Card tipo libro con spine + ribbon + MB
    BookCardMenu.tsx          # Menú 3 puntos (favorito/eliminar)
    BookEndScreen.tsx         # Pantalla final y acciones del cuento
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
    ReaderControls.tsx        # Controles flotantes, sliders y contador
    RecordComingSoonPanel.tsx # Panel aislado del modo grabar
  hooks/
    useBookLifecycle.ts       # Background, orientación, keep-awake y back nativo
    useBookMusic.ts           # Música, volumen persistente y mute
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
    BookScreen.tsx            # Orquestador del reader
    SettingsScreen.tsx        # Config con oso+zorro
  services/
    audioService.ts           # expo-audio: play/stop/fade/duck/loop
    downloadService.ts        # Descarga + extracción nativa + instalación validada
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

El catálogo contiene **94 libros**: `ADayInReverse` se distribuye embebido y los otros 93 se instalan bajo demanda. La lista base procede de los 92 libros incluidos en el APK y se complementa con novedades de la API. Cada entrada debe tener un ZIP en `books-zip/` y una portada registrada; `npm run validate:catalog` comprueba esa correspondencia.

La extracción se ejecuta de forma nativa, directamente entre el ZIP y una carpeta temporal. Antes de publicar el cuento, la app comprueba espacio libre, `Texts.csv` y `AdditionalInfo.json`, y después realiza una instalación con respaldo. Al incluir código nativo, hace falta un development build o un APK/AAB nuevo; Expo Go no puede ejecutar las descargas.

## Comandos

```bash
npm install --legacy-peer-deps    # Instalar dependencias
npx expo-doctor                   # Verificar salud (21/21)
npx tsc --noEmit                  # TypeScript check
npm run check                     # Catálogo + JSX + TypeScript
npm run build:eas                 # Build APK en la nube (EAS)
npm run deploy:apk                # Build local + subir al servidor Oracle
```

### Desarrollo Android en Windows

El AVD `Cuentos_Dev_API35` está configurado con GPU del host, 8 núcleos y 8 GB de RAM. En una primera terminal, inicia el emulador:

```powershell
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:PATH"
emulator -avd Cuentos_Dev_API35 -gpu host
```

Si `emulator` o `adb` no se reconocen, reinicia VS Code o vuelve a ejecutar la línea que actualiza `$env:PATH`.

En una segunda terminal, desde la raíz del proyecto, instala el cliente de desarrollo:

```powershell
New-Item -ItemType Directory -Path C:\g -Force
$env:GRADLE_USER_HOME = 'C:\g'
$env:JAVA_OPTS = '-Djavax.net.ssl.trustStoreType=Windows-ROOT'
$env:GRADLE_OPTS = '-Djavax.net.ssl.trustStoreType=Windows-ROOT -Dorg.gradle.jvmargs=-Xmx3072m -XX:MaxMetaspaceSize=1024m'
# Ejecutar esta limpieza solo después de cambiar GRADLE_USER_HOME.
Get-ChildItem node_modules -Directory -Recurse -Filter .cxx | Remove-Item -Recurse -Force
Remove-Item android\.cxx, android\app\.cxx -Recurse -Force -ErrorAction SilentlyContinue
Set-Location android
.\gradlew.bat app:installDebug -x lint -x test --configure-on-demand --build-cache -PreactNativeDevServerPort=8081 -PreactNativeArchitectures=x86_64 --no-daemon --max-workers=2
Set-Location ..
```

La limpieza de `.cxx` solo es necesaria al cambiar `GRADLE_USER_HOME`; evita que CMake reutilice rutas largas de una caché anterior. `--no-daemon` evita reutilizar procesos Gradle bloqueados, y `--max-workers=2` limita la memoria durante la compilación nativa.

Una vez instalado el cliente, para iniciar Metro y recargar cambios sin recompilar Android:

```powershell
npx expo start --dev-client --localhost
```

En otra terminal, con Metro iniciado y el emulador encendido, conecta el puerto local del emulador a Metro:

```powershell
adb reverse tcp:8081 tcp:8081
```

En el cliente de desarrollo pulsa **Fetch development servers** y elige el proyecto. Si no aparece o se queda conectado a una dirección anterior, en **Recently opened** pulsa **RESET** para borrar esa conexión y escribe `127.0.0.1:8081` en el campo `http://`.

El comando `adb reverse` debe ejecutarse cada vez que se reinicia el emulador. Permite que los assets locales, como audio y video, lleguen a Metro aunque este escuche sólo en `127.0.0.1`.

## Notas

- **Node.js 22** requerido (24+ incompatible)
- **expo-file-system/legacy** para API clásica en SDK 57
- **Orientación**: portrait para splash/onboarding, landscape para biblioteca/libro/settings
- **Package name**: `com.cuentos.dormir`
- **Navigation bar** oculta (immersive mode)
- **Audio**: loop infinito, volume slider, fade in/out, duck durante narración
- **Grabación**: placeholder "Próximamente" (infraestructura lista)

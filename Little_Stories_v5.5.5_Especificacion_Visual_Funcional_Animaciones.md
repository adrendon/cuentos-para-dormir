# Little Stories v5.5.5 — Especificación visual, funcional y de animaciones

> Análisis técnico generado a partir del APK decompilado proporcionado. El objetivo es documentar la app con suficiente detalle para poder reproducir su comportamiento visual en otra implementación.

## 0. Cómo leer este documento

Cada afirmación se marca implícitamente con uno de estos niveles de certeza:

- **Confirmado**: visible directamente en recursos, nombres de clases, estados, eventos, constantes o archivos multimedia del APK.
- **Confirmado parcialmente**: se conoce qué propiedad se anima (`alpha`, `scale`, posición, overlay, scroll), pero JADX no reconstruyó el cuerpo completo con todos los números.
- **Visual/estructural**: deducido por la combinación de assets y arquitectura; no se asigna una duración exacta si el APK decompilado no la expone.

**Importante:** salvo el splash de Diveo Media, no se encontraron GIFs ni secuencias de frames usadas como animación principal. La mayoría de transiciones son **Jetpack Compose** y se generan en tiempo real modificando posición, escala, transparencia, scroll y visibilidad.

## 1. Tecnologías visuales encontradas

| Elemento                 | Tecnología                                | Tipo                              |
| ------------------------ | ----------------------------------------- | --------------------------------- |
| Splash Android           | Android SplashScreen API / tema           | Fondo estático                    |
| Logo Diveo Media         | `res/raw/logo_video.mp4`                  | Video H.264 + audio AAC           |
| Navegación de pantallas  | Jetpack Compose / Navigation Compose      | Animación programática            |
| Apertura/cierre de libro | Compose + bitmap/overlay + alpha/posición | Transformación programática       |
| Menús, diálogos, filtros | Compose                                   | Slide/fade/scale según componente |
| Scroll de biblioteca     | Lazy list + scroll animado                | Programático                      |
| Selecciones              | Assets normal/selected + estado Compose   | Cambio visual                     |
| Audio                    | Media3 / ExoPlayer                        | Reproducción + fades de volumen   |

## 2. Paleta de colores exacta recuperada

| Uso                             |       Hex | Fuente                                         |
| ------------------------------- | --------: | ---------------------------------------------- |
| Splash / system background      | `#004B80` | `res/values/colors.xml → splash_bg`            |
| App background                  | `#03032A` | `uikit/theme/ColorKt.java → BackgroundColor`   |
| Title yellow                    | `#FFC000` | `TextTitleColor`                               |
| Red                             | `#FF4800` | `RedColor`                                     |
| Orange                          | `#FF8024` | `OrangeColor`                                  |
| Light blue                      | `#27C8FF` | `LightBlueColor`                               |
| Yellow                          | `#FFC357` | `YellowColor`                                  |
| Tooltip / text field background | `#EFEFE0` | `ToolTipBackground / TextFieldBackgroundColor` |
| Tooltip text                    | `#535970` | `ToolTipTextColor`                             |
| Text field text                 | `#606371` | `TextFieldColor`                               |
| Onboarding subtitle             | `#B5B7F8` | `OnboardingSubtitleColor`                      |
| Book pages blue                 | `#299CD4` | `BookPagesTextColor`                           |
| Input text                      | `#B9BAB3` | `InputTextColor`                               |
| Filter indicator                | `#2CACEB` | `FilterIndicatorColor`                         |
| Delete action                   | `#FE5109` | `DeleteActionColor`                            |
| Unviewed indicator              | `#FE3D2F` | `UnviewedIndicatorColor`                       |
| Ad / promo container            | `#0D7CC4` | `AdContainerColor`                             |
| Green chip                      | `#0CAC47` | `GreenChipColor`                               |
| Purple chip                     | `#8E4BF2` | `PurpleChipColor`                              |
| Blue chip                       | `#29B7DF` | `BlueChipColor`                                |
| Orange chip                     | `#FB8200` | `OrangeChipColor`                              |
| Disabled chip                   | `#898A9E` | `DisableChipColor`                             |
| Blue gradient start             | `#36C0ED` | `BlueStart`                                    |
| Blue gradient end               | `#2E80ED` | `BlueEnd`                                      |
| Dark blue gradient start        | `#3548A2` | `DarkBlueStart`                                |
| Dark blue gradient end          | `#2A3C84` | `DarkBlueEnd`                                  |
| Orange gradient start           | `#E5B840` | `OrangeStart`                                  |
| Orange gradient end             | `#F1893C` | `OrangeEnd`                                    |
| Green gradient start            | `#1BBF68` | `GreenStart`                                   |
| Green gradient end              | `#088E67` | `GreenEnd`                                     |
| Red gradient start              | `#F67834` | `RedStart`                                     |
| Red gradient end                | `#FF4901` | `RedEnd`                                       |
| Pink gradient start             | `#F780C5` | `PinkStart`                                    |
| Pink gradient end               | `#C828A6` | `PinkEnd`                                      |

### 2.1 Fondo principal

- Splash Android: **`#004B80`**.
- Fondo oscuro general de UI: **`#03032A`**.
- La app usa títulos amarillos, azules muy saturados y gradientes de botones/chips sobre un fondo azul-noche.

## 3. Arranque y splash — detalle temporal

### 3.1 Splash nativo de Android

- Recurso de color: `res/values/colors.xml → splash_bg`.
- Color: `#004B80`.
- En Android 12+ el icono animado configurado es `@drawable/transparent`; por tanto el splash del sistema es esencialmente una superficie azul.
- Duración: **variable**, depende de cuánto tarda la Activity en quedar lista. No debe implementarse como temporizador fijo.
- Movimiento: ninguno confirmado; es un frame estático administrado por Android.

### 3.2 Splash propio de Diveo Media

- Archivo: `res/raw/logo_video.mp4`.
- Duración exacta: **9.001 s**.
- Resolución: **792 × 720 px**.
- Frecuencia: **60 fps**.
- Video: **H.264**.
- Audio: **AAC**.
- No es GIF, Lottie ni Compose frame-by-frame: es un video real.

#### Timeline visual

|           Tiempo | Visual                             | Movimiento / efecto              | Tecnología |
| ---------------: | ---------------------------------- | -------------------------------- | ---------- |
| 0.0–0.4 s aprox. | Fondo azul                         | Estático                         | MP4        |
| 0.4–1.5 s aprox. | Aparece trazo/punto blanco central | Dibujo progresivo                | MP4        |
| 1.5–3.0 s aprox. | Se forma curva/espiral             | El trazo crece y se curva        | MP4        |
| 3.0–5.0 s aprox. | Se completa el símbolo Diveo       | Construcción progresiva          | MP4        |
| 5.0–6.0 s aprox. | Aparece `Diveo Media`              | Revelado/fade integrado al video | MP4        |
|      6.0–9.001 s | Logo completo centrado             | Retención visual                 | MP4        |
|          9.001 s | Fin                                | Dispara `AnimationCompleted`     | Código     |

Después del evento final, el splash propio reduce su **alpha** hasta desaparecer y solo entonces navega al destino inicial. La propiedad animada está confirmada; el valor exacto de duración del tween no quedó recuperado por JADX.

## 4. Arquitectura de navegación

Rutas/estados confirmados en el APK:

```text
Splash
Onboarding
Settings
LanguagePicker
Personalization
Library
Subscriptions
VerticalSubscriptions
Book/{bookId}/{bgColor}
NewBookNotification/{notifId}
```

### 4.1 Convención visual

- Los destinos no se renderizan como videos.
- Las pantallas usan un wrapper de animación Compose (`AnimatedScreenWrapper`).
- El decompilador conserva `Animatable<Float, AnimationVector1D>`, lo que confirma animaciones continuas de valores numéricos.
- En pantallas donde el código principal no quedó íntegro se documenta la dirección observada/estructural sin atribuir un milisegundo falso.

## 5. Onboarding

Assets principales:

- `image_onboarding_loading.webp`
- `image_onboarding_character.webp`
- `image_onboarding_boy.webp`
- `image_onbording_girl.webp`
- `image_onbording_no_ai.webp`
- `ic_onboarding_notification.webp`
- `ic_onboarding_notification_logo.webp`

### 5.1 Composición general

- Fondo oscuro/azul coherente con `BackgroundColor #03032A`.
- Títulos en gama amarilla (`#FFC000`).
- Subtítulos: `#B5B7F8`.
- Ilustraciones grandes se colocan como elementos independientes, no como parte de un video.
- Cada paso mantiene estado y genera eventos; al cambiar de paso, la interfaz Compose anima la sustitución.

### 5.2 Cambio entre pasos

- Tipo: **slide horizontal + cambios de alpha** en el flujo de onboarding.
- Dirección lógica de avance: contenido actual se desplaza hacia el lado de salida mientras el nuevo entra desde el lado contrario; el flujo se percibe como avance de páginas.
- Retroceso: transición inversa.
- Motor: Compose; no GIF/video.
- Los assets permanecen estáticos internamente salvo transformaciones Compose aplicadas al contenedor.
- Duración exacta: no se asigna porque el cuerpo principal del composable no quedó completo en la salida de JADX.

### 5.3 Nombre del niño

- Campo editable con fondo `#EFEFE0`, texto/controles en tonos `#606371` / `#B9BAB3`.
- El nombre dispara `ChildNameChanged`.
- La posición del campo está controlada por dimensiones específicas: `childInputFieldHeight`, `childInputTopPadding`, `childInputBottomPadding`.
- La pantalla reserva una zona central para el formulario y una zona inferior para continuar.

### 5.4 Género

- Estados de gráfico: `ic_boy.png` → `ic_boy_on.png`; `ic_girl.png` → `ic_girl_on.png`.
- Al tocar una tarjeta no se reproduce una película: cambia el estado y se sustituye/actualiza el recurso visual seleccionado.
- Existen dimensiones separadas para `genderMiddleSpace`, `genderSpaceBetweenCards`, `genderCardHeight`, `genderBottomPadding`.
- La elección afecta posteriormente las ilustraciones de los cuentos embebidos (hay variantes boy/girl).

### 5.5 Personaje / animal

- Recursos visibles recurrentes: oso, zorro, gato, pájaro, ratón y composiciones `all_animals.webp`.
- Eventos: `OnAnimalClicked`.
- Tooltips temporales: aproximadamente **2 s** por la espera basada en el timeout de ExoPlayer usada antes de ocultarlos.

### 5.6 Idioma

- Pantalla específica `LanguagePicker`.
- Recursos grandes: `ic_globe.webp`, `ic_cat.webp`.
- Layout: botón cerrar en zona superior; título; lista vertical; decoración lateral con globo/gato; botón confirmar hacia la zona inferior.
- La lista tiene máscara de desvanecimiento: existen `listFadeMaskHeightPx` y `listEdgeFade`, por lo que los extremos no terminan de forma abrupta.
- Confirmación: existe `OnConfirmLanguageAfterAnimation`; la navegación espera a que termine la animación.

### 5.7 Permiso de notificaciones

- Usa `ic_onboarding_notification.webp` y `ic_onboarding_notification_logo.webp` como explicación previa.
- Luego solicita el permiso nativo Android mediante `RequestPushPermission`.
- El diálogo del sistema no pertenece gráficamente a Little Stories.

## 6. Personalización / pantalla de carga

- Asset: `image_onboarding_loading.webp` / recurso de loading asociado.
- Dimensiones específicas confirmadas: `loadingIconHeight`, `loadingIconBottomPadding`, `loadingIconOffsetX`, `progressWidth`, `progressHeight`, `progressCornerRadius`.
- Existe una ventana `waitingDurationMs = 5000L`.
- El progreso se actualiza periódicamente con esperas de 1 s.
- Tras completar el proceso emite `NavigateToLibraryScreen`.
- El loading no es GIF: es UI Compose + recurso estático y progreso programático.

## 7. Biblioteca — composición

- Destino: `Library`.
- Portadas: `assets/bookCovers/`.
- Fondo: usa la familia de fondos oscuros/cielo del UIKit.
- Lista: componente `ListOfBooks` con scroll y conexión de fling.
- Se conservan dimensiones de altura de portada (`itemBookHeight`) y paddings verticales.
- Existe posición exacta del ítem enfocado (`FocusedBookData.focusedItemPosition: Offset`) y tamaño (`IntSize`), usados para reconstruir la animación.

### 7.1 Barra/controles de biblioteca

Acciones confirmadas:

- búsqueda (`ic_search.png`)
- filtros (`ic_filters.xml`)
- ajustes/configuración
- favoritos (`ic_favorite.xml`, `ic_unfavorite.xml`)
- descargar (`ic_download.png`)
- premium / desbloquear
- eliminar
- compartir

### 7.2 Biblioteca → Configuración

- Comportamiento visual solicitado/observado: **Settings entra verticalmente desde abajo hacia arriba**, como una hoja/pantalla que cubre la biblioteca.
- Al volver, la transición se invierte: Settings desciende y se revela la Biblioteca.
- Motor: Compose/navigation wrapper, no video.
- La pantalla entrante mantiene su propio fondo y composición; no es una captura desplazándose.
- Duración: no recuperada de forma segura en el decompilado, por lo que se debe medir del video de ejecución si se necesita réplica al milisegundo.

### 7.3 Abrir un libro desde una portada — animación detallada

Esta es una de las transiciones más sofisticadas.

1. El usuario toca una portada.
2. Se captura/retiene la información del ítem: libro, **posición absoluta `Offset`**, tamaño `IntSize`, relación/escala.
3. Se crea un `FocusedBookOverlay` por encima de la lista.
4. La portada de la lista deja de ser el elemento visual protagonista; el overlay ocupa su posición inicial para evitar un salto.
5. El overlay cambia gradualmente de posición/tamaño hacia la presentación del libro.
6. Se animan valores de transparencia: existe `bookAlpha : Animatable<Float>`.
7. La navegación no se da por terminada hasta que `bookAlpha == 0` en una de las fases y se dispara `onFocusAnimationFinished`.
8. La pantalla `Book/{bookId}/{bgColor}` toma el control.

**Tecnología:** bitmap/Compose overlay. **No** es GIF, video ni sprite sheet.

El APK también incluye `DividedImageBitmap` y caché de imagen de libro, consistente con dividir/reutilizar el bitmap durante apertura/cierre para conservar continuidad visual.

### 7.4 Cerrar el libro

- Eventos: `StartClosingBook` → `OnBookClose`.
- Es una transición coordinada, no un `popBackStack()` instantáneo.
- Se prepara la imagen/bitmap del libro y se devuelve visualmente hacia la posición de portada en Biblioteca.
- La animación es conceptualmente la inversa de la apertura: tamaño grande → tamaño de portada, posición de lectura → `FocusedBookData.focusedItemPosition`, y restauración de alpha.

### 7.5 Scroll, filtros y recentrado

- `AnimateScrollToTopAfterFilter` confirma scroll programático después de aplicar filtros.
- `AnimateReselScrollState`/reselección conserva continuidad de la lista.
- No es una transición de pantalla; el contenido mismo se desplaza verticalmente con animación de scroll.

### 7.6 Botones al volver del paywall

- `ButtonsContainer` contiene dos `Animatable`: **alpha** y **scale**.
- Cuando la biblioteca viene desde suscripción, ambos valores pueden restablecerse a `1.0`.
- Esto confirma que los botones de la biblioteca participan en fades/escalados, no solo aparecen/desaparecen.

## 8. Búsqueda y filtros

- Búsqueda: el campo recibe `UpdateSearchQuery`, luego `SubmitSearchQuery`.
- Filtros: `OpenFilterDialog`, `CloseFilterDialog`, `ApplyFilterConfig`, `OnClearFilters`.
- Indicador activo: color `#2CACEB`.
- Los diálogos/overlays usan una capa modal; el contenido de fondo permanece detrás.
- Cuando se aplican filtros, la lista puede animar hasta la parte superior.

## 9. Pantalla Settings — layout

El APK define dimensiones específicas para:

- `topStartButtonsPx`
- `topStartColumnPx`
- `mainTitleBottomSpacerHeight`
- `continueButtonBottomPadding`
- `topIconPaddingTop`
- `topIconHorizontalOneSidePadding`
- `topIconHeightMusic`
- `topIconHeightSettings`
- `topIconHeightMail`
- `topIconHeightSearch`
- `bearImageHeight`
- `foxImageHeight`
- `bearPaddingStart`
- `foxPaddingEnd`
- `bearBottomOffset`
- `foxBottomOffset`
- `childInputFieldHeight`
- `childInputTopPadding`
- `childInputBottomPadding`
- `genderMiddleSpace`
- `genderSpaceBetweenCards`
- `genderBottomPadding`
- `genderCardHeight`
- `mainTitleTopSpaceSize`
- `mainTitleTextSize`
- `childTitleTextSize`
- `childInputTextSize`
- `genderTitleTextSize`

Esto muestra que Settings se diseña de forma responsiva con posiciones/paddings parametrizados, no con una imagen de pantalla completa.

## 10. Pantalla de libro

- Ruta: `Book/{bookId}/{bgColor}`.
- El color de fondo se pasa como argumento, por lo que puede variar por libro.
- Los contenidos internos usan imágenes de `embeddedBooks` y textos procesados.
- Hay estados de UI para ocultar/mostrar controles superiores e inferiores.

### 10.1 Modos Leer / Escuchar / Grabar

| Modo     | Normal              | Seleccionado                 |
| -------- | ------------------- | ---------------------------- |
| Leer     | `image_read.webp`   | `image_read_selected.webp`   |
| Escuchar | `image_listen.webp` | `image_listen_selected.webp` |
| Grabar   | `image_record.webp` | `image_record_selected.webp` |

- El cambio de estado se realiza por Compose; los assets son estáticos.
- No hay un GIF entre los tres modos.
- La selección puede acompañarse de alpha/scale del contenedor, pero el recurso principal se sustituye por su variante selected.

### 10.2 Navegación de páginas

- Flechas: `ic_left_arrow.png` / `ic_left_arrow_pressed.png`, `ic_right_arrow.png` / `ic_right_arrow_pressed.png`.
- Al presionar existe un estado visual `pressed` independiente.
- Eventos distinguen clic y final de navegación (`HandleNavigateNextPageClicked`, `HandleNextPageNavigated`).
- La página cambia mediante UI programática; las ilustraciones son bitmaps, no video.

### 10.3 Ocultar controles

- Estados confirmados: `HideTopButtons`, `ShowTopButtons`, `HideBottomContainer`, `ShowBottomContainer`, `ToggleUIVisibility`.
- Por tanto el modo lectura puede despejar la pantalla dejando la ilustración/texto como foco.
- La ocultación es una transición visual de contenedores (alpha/posición según composable), no una nueva Activity.

### 10.4 Vista general de páginas

- `OpenPagesListOverview` / `ClosePagesListOverview`.
- `HandlePageClicked` selecciona una miniatura.
- `HandleEndCloseAnimationPagesListOverview` confirma que la lógica espera el final de la animación de cierre antes de continuar.
- Es un overlay/panel Compose sobre la experiencia del libro.

### 10.5 Última página

- Tiene estado propio: `OpenLastBookPage`, `CloseLastBookPage`.
- Al cerrar espera `HandleEndCloseAnimationLastBookPage`.
- Acciones: volver al inicio, Biblioteca y rating.

## 11. Menú hamburguesa dentro del libro

- Asset principal: `ic_content_burger.png`.
- Estado: `OpenMenuMode` / `CloseMenuMode`.
- El menú es un contenedor Compose superpuesto; no cambia de Activity.
- Incluye al menos reportar (`ic_flag_burger.png`) y tamaño de texto (`ic_font_burger.png` / `ic_t_text_size.png`).
- La apertura/cierre se trata como animación del contenedor; el fondo del libro permanece por debajo.

## 12. Tamaño de texto

- `TextSizeConfig` y `TextSizeUtils`.
- Evento: `HandleTextSizeChanged`.
- No se hace zoom sobre una captura: se vuelve a componer el texto con un tamaño diferente.

## 13. Escuchar / narración

- ExoPlayer/Media3 maneja audio.
- Recursos `ic_play.png`, `ic_pause.png` y elementos de voz.
- La narración se coordina con las páginas.
- Existe fade de volumen real: `fadeInVolume()` y `fadeOutVolume()` en `AudioPlayerServiceImpl`.
- Por tanto el audio puede entrar/salir gradualmente aunque la imagen no esté cambiando.

## 14. Voces

Estados visuales:

- `ic_micro_voice_item.png` — voz disponible/propia.
- `ic_micro_no_voice_item.png` — sin voz.
- `ic_download_voice.png` — disponible para descargar.
- `ic_downloading_voice.png` — descargando.
- `ic_delete_voice.png` — eliminar.
- `ic_bear_voice.png`, `ic_fox_voice.png` — voces/personajes.

El cambio entre estados es UI reactiva, no animación de frames.

## 15. Grabación

- `RecordButtonType` representa estados del botón.
- Recursos: `ic_recording.xml`, `ic_recording_disable.xml`, `ic_pause_recording.xml`, `ic_stop_button.png`.
- Flujo: preparado → grabando → pausado → detenido / borrador.
- El icono cambia según estado; no es un video.

## 16. Música ambiental

- Assets: `ic_music_on.png`, `ic_music_off.png`, `ic_sound_slider.png`, `music_active.png`.
- Eventos: `HandleVolumeOfMusicChanged`, `HandleListenMusicToggle`.
- El slider altera volumen de forma continua.
- El servicio de audio contiene fades al cambiar/reanudar pistas.

## 17. Paywall / suscripción

Assets destacados:

- `background_subscription_phone.webp`
- `background_subscription_tablet.webp`
- `stars.webp`
- `subscription_loading_bird.png`
- `subscription_loading_big_cloud.png`
- `subscription_loading_mid_cloud.png`
- `subscription_loading_small_cloud.png`
- `ic_unlock_books_badge.webp`
- `badge_wreath.webp`
- `vertical_paywall_close.webp`

### 17.1 Composición

- El fondo de teléfono y tablet es un WebP estático.
- Estrellas, pájaro y nubes están en archivos independientes, lo que permite moverlos por separado.
- Esto es indicio fuerte de animación Compose por capas/parallax, no de video pre-renderizado.
- `VerticalSubscriptions` tiene recursos propios, por lo que no es simplemente rotar la misma pantalla.

## 18. Nuevo libro / notificación

- Ruta propia: `NewBookNotification/{notifId}`.
- Al cerrar: `appear = false`, luego `delay(500L)`, después navegación atrás.
- Duración confirmada de la ventana de salida: **500 ms**.
- El cierre es por animación de visibilidad; la navegación espera ese medio segundo.

## 19. Cross-promo

- Componente: `TopPromoCarouselBar`.
- Flechas: `cross_promo_arrow_left.png`, `cross_promo_arrow_right.png`.
- Fondos: `ic_promo_background.webp`, `ic_promo_background_tablet.webp`.
- Campañas/assets separados para Dad the Cat, Puzzle, Tiny, YouTube/Music.
- La navegación entre promos se comporta como carrusel; las tarjetas/imágenes se desplazan horizontalmente.

## 20. Recursos de cuentos

- Portadas: `resources/assets/bookCovers/`.
- Libros embebidos: `resources/assets/embeddedBooks/`.
- Las ilustraciones internas no forman la UI global.
- Algunos libros incluyen versiones boy/girl; por ello el perfil del niño afecta el bitmap mostrado.

## 21. Recurso especial `page_001.png`

- Ruta: `res/drawable/page_001.png`.
- Resolución aproximada detectada: **3460 × 1600 px**.
- Tamaño ~3.3 MB.
- Es demasiado grande para ser un icono; se clasifica como ilustración/pantalla especial.

## 22. Icono de aplicación

- `mipmap-hdpi/ic_launcher.png` — 72×72.
- `mipmap-xxhdpi/ic_launcher.png` — 144×144.
- `mipmap-xxxhdpi/ic_launcher.png` — 192×192.
- Adaptive icon: `ic_launcher_foreground.png` + `ic_launcher_background.png` + `mipmap-anydpi/ic_launcher.xml`.

## 23. Matriz de transiciones

| Origen            | Acción             | Destino/estado     | Movimiento                                             | Efectos                             | Motor             | Tiempo                            |
| ----------------- | ------------------ | ------------------ | ------------------------------------------------------ | ----------------------------------- | ----------------- | --------------------------------- |
| Android launch    | Activity lista     | Splash propio      | Corte/entrega del sistema                              | fondo azul                          | Android API       | variable                          |
| Splash video      | termina            | Onboarding/Library | fade de pantalla                                       | alpha 1→0                           | Compose + MP4     | video 9.001 s; fade no recuperado |
| Onboarding paso N | continuar          | paso N+1           | slide horizontal                                       | alpha/contenido                     | Compose           | no recuperado                     |
| Onboarding        | atrás              | paso anterior      | slide horizontal inverso                               | alpha                               | Compose           | no recuperado                     |
| Library           | Settings           | Settings           | **sube desde abajo**                                   | pantalla sobre Library              | Compose/Nav       | no recuperado                     |
| Settings          | volver             | Library            | **baja hacia abajo**                                   | revela Library                      | Compose/Nav       | no recuperado                     |
| Library           | tocar portada      | Book               | portada se transforma desde su posición a vista grande | posición + tamaño + alpha + overlay | Compose           | no recuperado                     |
| Book              | volver             | Library            | transformación inversa hacia la portada                | posición + tamaño + alpha           | Compose           | no recuperado                     |
| Library           | aplicar filtro     | misma Library      | scroll vertical al inicio                              | scroll animado                      | Compose lazy list | variable                          |
| Book              | menú               | menú superpuesto   | panel/overlay animado                                  | visibilidad/alpha/posición          | Compose           | no recuperado                     |
| Book              | páginas overview   | overlay            | entrada del panel                                      | visibilidad/posición                | Compose           | no recuperado                     |
| NewBook           | cerrar             | anterior           | cierre animado                                         | `appear=false`                      | Compose           | **500 ms**                        |
| Personalization   | progreso           | Library            | transición al finalizar                                | progreso + navegación               | Compose           | ventana **5 s**                   |
| Promo             | siguiente/anterior | promo              | slide horizontal                                       | carrusel                            | Compose           | no recuperado                     |

## 24. Qué NO usa la app para estas transiciones

- No se encontraron GIFs propios.
- No se encontró evidencia de Lottie JSON en los recursos analizados.
- No se encontró una colección de sprites/frames dedicada a apertura de libro.
- La apertura de libro no es un video: usa datos de posición/tamaño, bitmap y alpha.
- La mayoría de assets `.png`/`.webp` son imágenes estáticas que Compose mueve/escala/desvanece.

## 25. Inventario gráfico clasificado

| Categoría                   | Cantidad aproximada detectada |
| --------------------------- | ----------------------------: |
| Cross-promo                 |                            11 |
| Icono de app                |                            15 |
| Ilustración especial        |                             1 |
| Lectura / audio / grabación |                            28 |
| Música externa / promo      |                             7 |
| Onboarding                  |                             4 |
| Personajes                  |                            16 |
| Suscripción / paywall       |                             9 |
| UI / navegación / otros     |                            63 |

### 25.1 Inventario con dimensiones

| Recurso                                                  | Categoría                   |        Px |     KB |
| -------------------------------------------------------- | --------------------------- | --------: | -----: |
| `res/drawable-xhdpi/all_animals.webp`                    | Personajes                  |  1211×450 |   71.1 |
| `res/drawable-xhdpi/background_subscription_phone.webp`  | Suscripción / paywall       |  1793×828 |   43.5 |
| `res/drawable-xhdpi/background_subscription_tablet.webp` | Suscripción / paywall       | 1822×1366 |   61.8 |
| `res/drawable-xhdpi/ic_bear_phone.webp`                  | Personajes                  |  960×1063 |   61.8 |
| `res/drawable-xhdpi/ic_bear_tablet.webp`                 | Personajes                  |   720×842 |   42.6 |
| `res/drawable-xhdpi/ic_cat.webp`                         | Personajes                  |  845×1142 |   55.5 |
| `res/drawable-xhdpi/ic_fox_phone.webp`                   | Personajes                  |  870×1117 |   55.1 |
| `res/drawable-xhdpi/ic_fox_tablet.webp`                  | Personajes                  |   640×860 |   36.0 |
| `res/drawable-xhdpi/ic_globe.webp`                       | UI / navegación / otros     |  895×1123 |   55.2 |
| `res/drawable-xhdpi/ic_loading_bunny.webp`               | Personajes                  | 1282×1550 |  130.1 |
| `res/drawable-xhdpi/ic_unlock_books_badge.webp`          | Suscripción / paywall       |   516×121 |    7.0 |
| `res/drawable-xhdpi/stars.webp`                          | Suscripción / paywall       |  1611×677 |   37.9 |
| `res/drawable/badge_wreath.webp`                         | UI / navegación / otros     |    60×160 |    2.3 |
| `res/drawable/boy.png`                                   | UI / navegación / otros     |   638×750 |  327.9 |
| `res/drawable/cross_promo_arrow_left.png`                | Cross-promo                 |     56×92 |    0.9 |
| `res/drawable/cross_promo_arrow_right.png`               | Cross-promo                 |     56×92 |    0.8 |
| `res/drawable/featured_by_google_ar.png`                 | UI / navegación / otros     |  1453×954 |   78.8 |
| `res/drawable/featured_by_google_de.png`                 | UI / navegación / otros     |  1860×959 |   74.6 |
| `res/drawable/featured_by_google_en.png`                 | UI / navegación / otros     |  1968×959 |   74.5 |
| `res/drawable/featured_by_google_es.png`                 | UI / navegación / otros     |  1900×959 |   73.7 |
| `res/drawable/featured_by_google_fr.png`                 | UI / navegación / otros     |  1880×959 |   74.4 |
| `res/drawable/featured_by_google_in.png`                 | UI / navegación / otros     |  1726×959 |   70.5 |
| `res/drawable/featured_by_google_it.png`                 | UI / navegación / otros     |  1766×959 |   72.3 |
| `res/drawable/featured_by_google_ja.png`                 | UI / navegación / otros     |  1714×959 |   74.8 |
| `res/drawable/featured_by_google_ms.png`                 | UI / navegación / otros     |  1726×959 |   70.5 |
| `res/drawable/featured_by_google_nl.png`                 | UI / navegación / otros     |  1094×480 |   31.8 |
| `res/drawable/featured_by_google_pl.png`                 | UI / navegación / otros     |  1154×480 |   32.9 |
| `res/drawable/featured_by_google_pt.png`                 | UI / navegación / otros     |  1956×959 |   74.1 |
| `res/drawable/featured_by_google_ru.png`                 | UI / navegación / otros     |  1726×959 |   71.9 |
| `res/drawable/featured_by_google_sv.png`                 | UI / navegación / otros     |  1476×720 |   52.1 |
| `res/drawable/ic_amazon_music.webp`                      | Lectura / audio / grabación |   204×204 |    5.9 |
| `res/drawable/ic_apple_music.webp`                       | Lectura / audio / grabación |   204×204 |    4.8 |
| `res/drawable/ic_arrow_up.png`                           | UI / navegación / otros     |   288×360 |    4.6 |
| `res/drawable/ic_bear_voice.png`                         | Personajes                  |   269×380 |   37.5 |
| `res/drawable/ic_book_beginning.png`                     | UI / navegación / otros     |   261×279 |    6.1 |
| `res/drawable/ic_book_listen.png`                        | Lectura / audio / grabación |   279×220 |   10.2 |
| `res/drawable/ic_book_read.png`                          | Lectura / audio / grabación |   279×225 |    6.4 |
| `res/drawable/ic_book_record.png`                        | Lectura / audio / grabación |   279×220 |    7.4 |
| `res/drawable/ic_boy.png`                                | UI / navegación / otros     |   534×762 |   86.9 |
| `res/drawable/ic_boy_on.png`                             | UI / navegación / otros     |   534×762 |  199.7 |
| `res/drawable/ic_close.png`                              | UI / navegación / otros     |   375×375 |    3.9 |
| `res/drawable/ic_confirm.png`                            | UI / navegación / otros     |   312×246 |    2.0 |
| `res/drawable/ic_content_burger.png`                     | UI / navegación / otros     |     89×89 |    0.5 |
| `res/drawable/ic_continue_button.png`                    | UI / navegación / otros     |     95×95 |    2.4 |
| `res/drawable/ic_dad_the_cat.webp`                       | Personajes                  |   372×372 |   10.7 |
| `res/drawable/ic_dad_the_cat_left.webp`                  | Personajes                  |   714×612 |   27.5 |
| `res/drawable/ic_dad_the_cat_right.webp`                 | Personajes                  |   714×612 |   25.9 |
| `res/drawable/ic_deezer.webp`                            | Música externa / promo      |   204×204 |    4.5 |
| `res/drawable/ic_delete.png`                             | UI / navegación / otros     |   280×292 |   14.5 |
| `res/drawable/ic_delete_voice.png`                       | Lectura / audio / grabación |   372×388 |   17.6 |
| `res/drawable/ic_disable_play.png`                       | Lectura / audio / grabación |   380×380 |    4.9 |
| `res/drawable/ic_download.png`                           | UI / navegación / otros     |   477×477 |    6.9 |
| `res/drawable/ic_download_voice.png`                     | Lectura / audio / grabación |   372×372 |    5.1 |
| `res/drawable/ic_downloading_voice.png`                  | Lectura / audio / grabación |   225×225 |   29.1 |
| `res/drawable/ic_flag_burger.png`                        | UI / navegación / otros     |     89×89 |    0.6 |
| `res/drawable/ic_font_burger.png`                        | UI / navegación / otros     |     89×99 |    1.1 |
| `res/drawable/ic_fox_voice.png`                          | Personajes                  |   368×388 |   45.8 |
| `res/drawable/ic_gift.png`                               | UI / navegación / otros     |   258×283 |   24.8 |
| `res/drawable/ic_girl.png`                               | UI / navegación / otros     |   534×759 |   71.6 |
| `res/drawable/ic_girl_on.png`                            | UI / navegación / otros     |   533×759 |  203.0 |
| `res/drawable/ic_home.png`                               | UI / navegación / otros     |   375×351 |   34.8 |
| `res/drawable/ic_language_off.png`                       | UI / navegación / otros     |   498×537 |  274.8 |
| `res/drawable/ic_language_on.png`                        | UI / navegación / otros     |   498×528 |  279.6 |
| `res/drawable/ic_left_arrow.png`                         | UI / navegación / otros     |   512×703 |  195.6 |
| `res/drawable/ic_left_arrow_pressed.png`                 | UI / navegación / otros     |   170×234 |    2.1 |
| `res/drawable/ic_library.png`                            | UI / navegación / otros     |   261×280 |    6.5 |
| `res/drawable/ic_loading_book.png`                       | UI / navegación / otros     |   155×158 |    7.9 |
| `res/drawable/ic_lock.png`                               | UI / navegación / otros     |   423×511 |  121.1 |
| `res/drawable/ic_logo_dm.png`                            | UI / navegación / otros     |   178×178 |   17.6 |
| `res/drawable/ic_mail_to.png`                            | UI / navegación / otros     |   303×243 |    8.3 |
| `res/drawable/ic_micro_no_voice_item.png`                | Lectura / audio / grabación |   400×321 |   12.3 |
| `res/drawable/ic_micro_voice.png`                        | Lectura / audio / grabación |   368×388 |   33.6 |
| `res/drawable/ic_micro_voice_item.png`                   | Lectura / audio / grabación |   396×316 |   12.5 |
| `res/drawable/ic_music_left.webp`                        | Lectura / audio / grabación |   714×612 |   18.2 |
| `res/drawable/ic_music_off.png`                          | Lectura / audio / grabación |   170×167 |    3.9 |
| `res/drawable/ic_music_on.png`                           | Lectura / audio / grabación |   170×167 |    3.2 |
| `res/drawable/ic_music_right.webp`                       | Lectura / audio / grabación |   714×612 |   50.2 |
| `res/drawable/ic_nav_dad_the_cat.webp`                   | Personajes                  |   270×270 |    3.8 |
| `res/drawable/ic_nav_music.webp`                         | Lectura / audio / grabación |   224×224 |    5.1 |
| `res/drawable/ic_nav_puzzle_me.webp`                     | Cross-promo                 |   224×224 |    7.4 |
| `res/drawable/ic_nav_youtube.webp`                       | Música externa / promo      |   224×224 |    1.8 |
| `res/drawable/ic_onboarding_notification.webp`           | Onboarding                  |   786×632 |  257.3 |
| `res/drawable/ic_page_mark.png`                          | UI / navegación / otros     |   378×506 |    1.5 |
| `res/drawable/ic_pause.png`                              | Lectura / audio / grabación |     95×95 |    1.9 |
| `res/drawable/ic_play.png`                               | Lectura / audio / grabación |   380×379 |   12.8 |
| `res/drawable/ic_promo_background.webp`                  | Cross-promo                 | 2688×1242 |   10.0 |
| `res/drawable/ic_promo_background_tablet.webp`           | Cross-promo                 | 2732×2048 |   14.6 |
| `res/drawable/ic_push_notification.png`                  | Personajes                  |     48×48 |    0.9 |
| `res/drawable/ic_puzzle_icon.webp`                       | Cross-promo                 |   256×256 |    8.5 |
| `res/drawable/ic_puzzle_left.webp`                       | Cross-promo                 |   714×612 |   41.3 |
| `res/drawable/ic_puzzle_right.webp`                      | Cross-promo                 |   714×612 |   47.9 |
| `res/drawable/ic_right_arrow.png`                        | UI / navegación / otros     |   511×703 |  195.4 |
| `res/drawable/ic_right_arrow_pressed.png`                | UI / navegación / otros     |   170×234 |    2.1 |
| `res/drawable/ic_search.png`                             | UI / navegación / otros     |   297×291 |   11.2 |
| `res/drawable/ic_settings.png`                           | UI / navegación / otros     |   306×324 |   16.7 |
| `res/drawable/ic_settings_language.png`                  | UI / navegación / otros     |   436×436 |   28.7 |
| `res/drawable/ic_settings_question.png`                  | UI / navegación / otros     |   444×462 |   67.1 |
| `res/drawable/ic_share.png`                              | UI / navegación / otros     |   185×221 |    4.3 |
| `res/drawable/ic_snow_ball_big.png`                      | UI / navegación / otros     |     81×81 |    4.8 |
| `res/drawable/ic_snow_ball_small.png`                    | UI / navegación / otros     |     34×34 |    1.5 |
| `res/drawable/ic_sound_slider.png`                       | Lectura / audio / grabación |   214×214 |   20.1 |
| `res/drawable/ic_spotify.webp`                           | Música externa / promo      |   204×204 |    4.9 |
| `res/drawable/ic_star_empty.png`                         | UI / navegación / otros     |     72×67 |    1.6 |
| `res/drawable/ic_star_full.png`                          | UI / navegación / otros     |     72×67 |    1.0 |
| `res/drawable/ic_star_half.png`                          | UI / navegación / otros     |     72×67 |    1.5 |
| `res/drawable/ic_stop_button.png`                        | UI / navegación / otros     |   284×284 |    2.5 |
| `res/drawable/ic_t_text_size.png`                        | UI / navegación / otros     |   102×125 |    2.4 |
| `res/drawable/ic_tidal.webp`                             | Música externa / promo      |   204×204 |    4.2 |
| `res/drawable/ic_tiny_icon.webp`                         | Cross-promo                 |   270×270 |    9.2 |
| `res/drawable/ic_tiny_left.webp`                         | Cross-promo                 |   714×612 |   34.4 |
| `res/drawable/ic_tiny_right.webp`                        | Cross-promo                 |   714×612 |   39.9 |
| `res/drawable/ic_wifi_locked.png`                        | UI / navegación / otros     |   211×211 |   19.2 |
| `res/drawable/ic_youtube_dm.webp`                        | Música externa / promo      |   256×256 |    7.8 |
| `res/drawable/ic_youtube_left.webp`                      | Música externa / promo      |   714×612 |   40.7 |
| `res/drawable/ic_youtube_music.webp`                     | Lectura / audio / grabación |   204×204 |    4.6 |
| `res/drawable/ic_youtube_right.webp`                     | Música externa / promo      |   714×612 |   68.1 |
| `res/drawable/image_bird.png`                            | Personajes                  |   626×583 |  279.8 |
| `res/drawable/image_listen.webp`                         | Lectura / audio / grabación |   222×180 |    5.2 |
| `res/drawable/image_listen_selected.webp`                | Lectura / audio / grabación |   222×180 |   11.0 |
| `res/drawable/image_mouse.png`                           | Personajes                  |   853×651 |  387.2 |
| `res/drawable/image_onboarding_boy.webp`                 | Onboarding                  |   786×844 |   20.4 |
| `res/drawable/image_onboarding_character.webp`           | Onboarding                  |   786×694 |   82.8 |
| `res/drawable/image_onboarding_loading.webp`             | Onboarding                  |   786×732 |   32.2 |
| `res/drawable/image_onbording_girl.webp`                 | UI / navegación / otros     |   786×844 |   21.5 |
| `res/drawable/image_onbording_no_ai.webp`                | UI / navegación / otros     |   786×790 |   92.1 |
| `res/drawable/image_read.webp`                           | Lectura / audio / grabación |   222×180 |    3.4 |
| `res/drawable/image_read_selected.webp`                  | Lectura / audio / grabación |   222×180 |    7.6 |
| `res/drawable/image_record.webp`                         | Lectura / audio / grabación |   222×180 |    4.2 |
| `res/drawable/image_record_selected.webp`                | Lectura / audio / grabación |   222×180 |   10.4 |
| `res/drawable/music_active.png`                          | Lectura / audio / grabación |   232×258 |   18.3 |
| `res/drawable/page_001.png`                              | Ilustración especial        | 3460×1600 | 3234.2 |
| `res/drawable/small_circle.png`                          | UI / navegación / otros     |     24×23 |    0.5 |
| `res/drawable/small_star.png`                            | UI / navegación / otros     |     22×22 |    0.4 |
| `res/drawable/subscription_loading_big_cloud.png`        | Suscripción / paywall       |     90×90 |    9.0 |
| `res/drawable/subscription_loading_bird.png`             | Suscripción / paywall       |   480×400 |  181.2 |
| `res/drawable/subscription_loading_mid_cloud.png`        | Suscripción / paywall       |     60×60 |    4.2 |
| `res/drawable/subscription_loading_small_cloud.png`      | Suscripción / paywall       |     42×42 |    2.6 |
| `res/drawable/tooltip_arrow.png`                         | UI / navegación / otros     |   304×216 |   12.8 |
| `res/drawable/vertical_paywall_close.webp`               | Suscripción / paywall       |   128×128 |    7.2 |
| `res/mipmap-hdpi/ic_launcher.png`                        | Icono de app                |     72×72 |    8.0 |
| `res/mipmap-hdpi/ic_launcher_background.png`             | Icono de app                |   162×162 |    0.2 |
| `res/mipmap-hdpi/ic_launcher_foreground.png`             | Icono de app                |   162×162 |   23.6 |
| `res/mipmap-mdpi/ic_launcher.png`                        | Icono de app                |     48×48 |    4.1 |
| `res/mipmap-mdpi/ic_launcher_background.png`             | Icono de app                |   108×108 |    0.1 |
| `res/mipmap-mdpi/ic_launcher_foreground.png`             | Icono de app                |   108×108 |   12.3 |
| `res/mipmap-xhdpi/ic_launcher.png`                       | Icono de app                |     96×96 |   13.3 |
| `res/mipmap-xhdpi/ic_launcher_background.png`            | Icono de app                |   216×216 |    0.3 |
| `res/mipmap-xhdpi/ic_launcher_foreground.png`            | Icono de app                |   216×216 |   41.4 |
| `res/mipmap-xxhdpi/ic_launcher.png`                      | Icono de app                |   144×144 |   25.8 |
| `res/mipmap-xxhdpi/ic_launcher_background.png`           | Icono de app                |   324×324 |    0.5 |
| `res/mipmap-xxhdpi/ic_launcher_foreground.png`           | Icono de app                |   324×324 |   82.8 |
| `res/mipmap-xxxhdpi/ic_launcher.png`                     | Icono de app                |   192×192 |   44.8 |
| `res/mipmap-xxxhdpi/ic_launcher_background.png`          | Icono de app                |   432×432 |    0.7 |
| `res/mipmap-xxxhdpi/ic_launcher_foreground.png`          | Icono de app                |   432×432 |  161.0 |

## 26. Guía de réplica en React Native / Expo

Para reproducir visualmente la app sin copiar su código:

- Splash: usar video local de 9.001 s solo si se cuenta legítimamente con ese asset; luego animar opacity de la capa.
- Navegación Settings: `translateY` desde altura de pantalla a 0; back de 0 a altura.
- Onboarding: dos contenedores simultáneos con `translateX` en sentidos opuestos + `opacity` para continuidad.
- Apertura libro: medir `x/y/width/height` de la portada, renderizar un overlay absoluto y animarlo hacia el rectángulo final; sincronizar opacity del contenido.
- Cierre: usar geometría inversa y mantener la lista en la misma posición de scroll.
- Overviews/menús: overlays absolutos con fondo atenuado y panel animado.
- Paywall: mantener fondo estático y animar nubes/pájaro como capas independientes.

## 27. Valores que deben medirse en ejecución para una réplica 1:1

El APK decompilado no permite garantizar estos valores en todos los composables:

- duración exacta del slide de Settings;
- duración exacta de cada paso de onboarding;
- curva de easing de la apertura/cierre de libro;
- coordenadas finales exactas del overlay en cada resolución;
- duración exacta de menú hamburguesa, page overview y algunos fades;
- amplitud/velocidad de nubes y pájaro del paywall.

Para esos puntos, la fuente correcta es una grabación a 60 fps de la aplicación funcionando. Se pueden medir frames y convertirlos a milisegundos (`frames / 60 × 1000`).

## 28. Conclusión

Little Stories combina **assets estáticos grandes y muy ilustrados** con una capa de animación creada mayoritariamente en **Jetpack Compose**. El único video de identidad visual confirmado es `logo_video.mp4`. La característica visual más importante para replicar no es un sprite o GIF oculto, sino la continuidad de estado: portada → overlay → libro y libro → overlay → portada, además de slides direccionales entre pantallas y fades de contenedores.

Este documento distingue deliberadamente entre valores recuperados del APK y valores que deben medirse en ejecución para no presentar aproximaciones como hechos.

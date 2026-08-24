/**
 * Exact color palette recovered from Little Stories v5.5.5 APK.
 * Source: ColorKt.java / res/values/colors.xml
 */
export const Colors = {
  // Core backgrounds
  splashBackground: '#004B80',
  backgroundDark: '#03032A',
  backgroundGradientStart: '#03032A',
  backgroundGradientEnd: '#03032A',

  // Text
  titleYellow: '#FFC000',
  textWhite: '#FFFFFF',
  textBlack: '#000000',
  red: '#FF4800',
  orange: '#FF8024',
  lightBlue: '#27C8FF',
  yellow: '#FFC357',

  // UI elements
  tooltipBackground: '#EFEFE0',
  tooltipText: '#535970',
  textFieldBackground: '#EFEFE0',
  textFieldColor: '#606371',
  inputTextColor: '#B9BAB3',
  onboardingSubtitle: '#B5B7F8',
  bookPagesText: '#299CD4',
  filterIndicator: '#2CACEB',
  deleteAction: '#FE5109',
  unviewedIndicator: '#FE3D2F',
  adContainer: '#0D7CC4',

  // Chips
  chipGreen: '#0CAC47',
  chipPurple: '#8E4BF2',
  chipBlue: '#29B7DF',
  chipOrange: '#FB8200',
  chipDisabled: '#898A9E',

  // Legacy aliases (keep for components not yet updated)
  titleGold: '#FFC000',
  textGrayLight: '#B5B7F8',
  subtitleGray: '#B5B7F8',
  accentCyan: '#27C8FF',
  accentTurquoise: '#27C8FF',
  accentYellow: '#FFC000',
  accentOrange: '#FF8024',
  success: '#0CAC47',
  error: '#FE5109',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  overlayBlack: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  capsuleSelected: 'rgba(142, 75, 242, 0.35)',

  // Deprecated names kept for backward compat
  buttonBlueStart: '#FFC000',
  buttonBlueEnd: '#FF8024',
  buttonOrangeStart: '#3548A2',
  buttonOrangeEnd: '#2A3C84',
  buttonGreenStart: '#1BBF68',
  buttonGreenEnd: '#088E67',
} as const;

export const Gradients = {
  // Blue gradient (mode buttons, library accents)
  blue: ['#36C0ED', '#2E80ED'] as const,
  // Dark blue (secondary containers)
  darkBlue: ['#3548A2', '#2A3C84'] as const,
  // Orange (primary CTA: Continuar, main buttons)
  orange: ['#E5B840', '#F1893C'] as const,
  // Green
  green: ['#1BBF68', '#088E67'] as const,
  // Red
  red: ['#F67834', '#FF4901'] as const,
  // Pink
  pink: ['#F780C5', '#C828A6'] as const,

  // Aliases
  primaryButton: ['#E5B840', '#F1893C'] as const,
  secondaryButton: ['#3548A2', '#2A3C84'] as const,
  greenButton: ['#1BBF68', '#088E67'] as const,
  background: ['#03032A', '#03032A'] as const,
} as const;

export const Fonts = {
  /** Rounded bold font for titles (Baloo Bhaijaan) */
  title: 'BalooBhaijaan',
  /** Semi-bold body text (Montserrat) */
  body: 'Montserrat-SemiBold',
  /** Extra bold headings/buttons (Montserrat) */
  heading: 'Montserrat-ExtraBold',
} as const;

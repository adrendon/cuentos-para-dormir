export const Colors = {
  // Backgrounds (violet/purple starry night, matches original app)
  backgroundDark: '#171254',
  backgroundGradientStart: '#201660',
  backgroundGradientEnd: '#272073',

  // Text
  titleGold: '#F5C12E',
  textBlack: '#000000',
  textWhite: '#FFFFFF',
  textGrayLight: '#B8B4DE',
  subtitleGray: '#B8B4DE',

  // Buttons - Primary (yellow -> orange gradient, main CTA)
  buttonBlueStart: '#F5C12E',
  buttonBlueEnd: '#F7942E',

  // Buttons - Secondary (blue, secondary actions)
  buttonOrangeStart: '#3E70DC',
  buttonOrangeEnd: '#2C4EED',

  // Buttons - Green gradient
  buttonGreenStart: '#1B9668',
  buttonGreenEnd: '#06A867',

  // Chips/Tags
  chipGreen: '#0E8547',
  chipPurple: '#8B43F2',
  chipBlue: '#29B3DF',
  chipOrange: '#F89900',

  // Accents
  accentCyan: '#25C8EE',
  accentTurquoise: '#14CFC9',
  accentYellow: '#F5C12E',
  accentOrange: '#F7942E',

  // Placeholders
  placeholderGreen: '#B17EA4',
  placeholderPurple: '#A67EA5',
  placeholderBrown: '#AC7EA5',

  // Splash
  // Deep blue sampled from the original Diveo Media splash (not the purple
  // used by the library screens).
  splashBackground: '#111F59',

  // Overlay
  overlayBlack: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  capsuleSelected: 'rgba(139, 67, 242, 0.35)',

  // Status
  success: '#06A867',
  error: '#E53935',

  // Card
  cardShadow: 'rgba(0, 0, 0, 0.3)',
} as const;

export const Gradients = {
  primaryButton: [Colors.buttonBlueStart, Colors.buttonBlueEnd] as const,
  secondaryButton: [Colors.buttonOrangeStart, Colors.buttonOrangeEnd] as const,
  greenButton: [Colors.buttonGreenStart, Colors.buttonGreenEnd] as const,
  background: [Colors.backgroundGradientStart, Colors.backgroundGradientEnd] as const,
} as const;

export const Fonts = {
  /** Rounded bold font for titles (Baloo Bhaijaan) */
  title: 'BalooBhaijaan',
  /** Semi-bold body text */
  body: 'Montserrat-SemiBold',
  /** Extra bold headings */
  heading: 'Montserrat-ExtraBold',
} as const;

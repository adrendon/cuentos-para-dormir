export const Colors = {
  // Backgrounds
  backgroundDark: '#003A1A',
  backgroundGradientStart: '#003A1A',
  backgroundGradientEnd: '#00261A',

  // Text
  titleGold: '#FFD700',
  textBlack: '#000000',
  textWhite: '#FFFFFF',
  textGrayLight: '#B0B0B0',
  subtitleGray: '#A0A0A0',

  // Buttons - Primary (blue gradient)
  buttonBlueStart: '#365BED',
  buttonBlueEnd: '#2C4EED',

  // Buttons - Secondary (orange gradient)
  buttonOrangeStart: '#E36B00',
  buttonOrangeEnd: '#F09E3C',

  // Buttons - Green gradient
  buttonGreenStart: '#1B9668',
  buttonGreenEnd: '#06A867',

  // Chips/Tags
  chipGreen: '#0E8547',
  chipPurple: '#8B43F2',
  chipBlue: '#29B3DF',
  chipOrange: '#F89900',

  // Placeholders
  placeholderGreen: '#B17EA4',
  placeholderPurple: '#A67EA5',
  placeholderBrown: '#AC7EA5',

  // Splash
  splashBackground: '#003A1A',

  // Overlay
  overlayBlack: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',

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

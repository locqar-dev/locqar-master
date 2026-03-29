// Font families
export const ff = "'Inter', system-ui, -apple-system, sans-serif";
export const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";
export const mf = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

export const lightTheme = {
  // Core — matches customer app (iOS HIG palette)
  bg:     '#FAFAFA',
  card:   '#FFFFFF',
  fill:   '#F5F5F7',
  fill2:  '#EBEBF0',
  border: '#E5E5EA',
  text:   '#1C1C1E',
  sec:    '#8E8E93',
  muted:  '#AEAEB2',

  // Red
  red:      '#FF2D55',
  redBg:    '#FFE5EC',
  redDark:  '#D00036',
  redLight: '#FF6B8A',

  // Green
  green:      '#34C759',
  greenBg:    '#E4F8EA',
  greenDark:  '#248A3D',
  greenLight: '#86D996',

  // Amber
  amber:      '#FF9500',
  amberBg:    '#FFF4E5',
  amberDark:  '#C87400',
  amberLight: '#FFB340',

  // Blue
  blue:      '#007AFF',
  blueBg:    '#E5F1FF',
  blueDark:  '#0055B3',
  blueLight: '#5AC8FA',

  // Purple
  purple:      '#AF52DE',
  purpleBg:    '#F7EBFC',
  purpleDark:  '#8944AB',
  purpleLight: '#CF8EF4',

  // Accent — Indigo
  accent:         '#4F46E5',
  accentBg:       '#EEF2FF',
  accentDark:     '#3730A3',
  accentGradient: 'linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)',

  // Shadows — matches customer app
  shadow:   '0 8px 24px rgba(28,28,30,0.04), 0 2px 8px rgba(28,28,30,0.02)',
  shadowMd: '0 16px 40px rgba(28,28,30,0.08), 0 4px 16px rgba(28,28,30,0.04)',
  shadowLg: '0 32px 64px rgba(28,28,30,0.14), 0 8px 24px rgba(28,28,30,0.08)',

  // Gradients
  gradient:        'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
  gradientAccent:  'linear-gradient(135deg, #FF2D55 0%, #FF3B30 100%)',
  gradientSuccess: 'linear-gradient(135deg, #34C759 0%, #30B551 100%)',
  gradientBlue:    'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
  gradientAmber:   'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',

  // Utility
  overlay:      'rgba(0,0,0,0.4)',
  overlayLight: 'rgba(0,0,0,0.15)',
  overlayDark:  'rgba(0,0,0,0.6)',
};

export const darkTheme = {
  // Core — matches customer app dark (iOS HIG dark palette)
  bg:     '#000000',
  card:   '#1C1C1E',
  fill:   '#1C1C1E',
  fill2:  '#2C2C2E',
  border: '#3A3A3C',
  text:   '#F2F2F7',
  sec:    '#8E8E93',
  muted:  '#636366',

  // Red
  red:      '#FF375F',
  redBg:    '#3E0A1B',
  redDark:  '#FF6B8A',
  redLight: '#FF6B8A',

  // Green
  green:      '#30D158',
  greenBg:    '#0A3618',
  greenDark:  '#32D74B',
  greenLight: '#86D996',

  // Amber
  amber:      '#FF9F0A',
  amberBg:    '#3E2500',
  amberDark:  '#FFB340',
  amberLight: '#FFB340',

  // Blue
  blue:      '#0A84FF',
  blueBg:    '#002E6B',
  blueDark:  '#5AC8FA',
  blueLight: '#5AC8FA',

  // Purple
  purple:      '#BF5AF2',
  purpleBg:    '#3D1B54',
  purpleDark:  '#CF8EF4',
  purpleLight: '#CF8EF4',

  // Accent — Indigo (brighter for dark bg)
  accent:         '#818CF8',
  accentBg:       '#1E1B4B',
  accentDark:     '#6366F1',
  accentGradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',

  // Shadows
  shadow:   '0 8px 24px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
  shadowMd: '0 16px 40px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)',
  shadowLg: '0 32px 64px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)',

  // Gradients
  gradient:        'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)',
  gradientAccent:  'linear-gradient(135deg, #FF375F 0%, #D00036 100%)',
  gradientSuccess: 'linear-gradient(135deg, #30D158 0%, #248A3D 100%)',
  gradientBlue:    'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)',
  gradientAmber:   'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)',

  // Utility
  overlay:      'rgba(0,0,0,0.6)',
  overlayLight: 'rgba(0,0,0,0.3)',
  overlayDark:  'rgba(0,0,0,0.8)',
};

// Default theme (light)
export const T = Object.assign({}, lightTheme);

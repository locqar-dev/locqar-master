/**
 * Theme adapters normalize each app's theme into a common shape
 * so shared components can work across all apps.
 *
 * Common shape:
 *   bg, card, fill, fill2, border, text, secondary, muted,
 *   accent, accentBg, success, successBg, warning, warningBg,
 *   danger, dangerBg, info, infoBg,
 *   shadow, shadowMd, shadowLg, font
 */

// Courier App: flat T object (T.red, T.green, T.amber, etc.)
export function fromCourierTheme(T) {
  return {
    bg: T.bg, card: T.card, fill: T.fill, fill2: T.fill2, border: T.border,
    text: T.text, secondary: T.sec, muted: T.muted,
    accent: T.red, accentBg: T.redBg,
    success: T.green, successBg: T.greenBg,
    warning: T.amber, warningBg: T.amberBg,
    danger: T.red, dangerBg: T.redBg,
    info: T.blue, infoBg: T.blueBg,
    shadow: T.shadow, shadowMd: T.shadowMd, shadowLg: T.shadowLg,
    font: "'Inter',system-ui,sans-serif",
  };
}

// Customer App: mutable T singleton (T.accent, T.ok, T.warn, etc.)
export function fromCustomerTheme(T) {
  return {
    bg: T.bg, card: T.card, fill: T.fill, fill2: T.fill2, border: T.border,
    text: T.text, secondary: T.sec, muted: T.muted,
    accent: T.accent, accentBg: T.accentBg,
    success: T.ok, successBg: T.okBg,
    warning: T.warn, warningBg: T.warnBg,
    danger: T.accent, dangerBg: T.accentBg,
    info: T.blue, infoBg: T.blueBg,
    shadow: T.shadow, shadowMd: T.shadowMd, shadowLg: T.shadowLg,
    font: "'Inter',system-ui,sans-serif",
  };
}

// Admin Portal: nested theme context (theme.bg.card, theme.status.success, etc.)
export function fromAdminTheme(theme) {
  return {
    bg: theme.bg.primary, card: theme.bg.card, fill: theme.bg.tertiary, fill2: theme.bg.hover, border: theme.border.primary,
    text: theme.text.primary, secondary: theme.text.secondary, muted: theme.text.muted,
    accent: theme.accent.primary, accentBg: theme.accent.light,
    success: theme.status.success, successBg: theme.accent.light,
    warning: theme.status.warning, warningBg: theme.accent.light,
    danger: theme.status.error, dangerBg: theme.accent.light,
    info: theme.status.info, infoBg: theme.accent.light,
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    shadowMd: '0 4px 6px rgba(0,0,0,0.1)',
    shadowLg: '0 20px 25px rgba(0,0,0,0.1)',
    font: theme.font.primary,
  };
}

// Default fallback theme (light)
export var defaultTheme = {
  bg: '#FAFAFA', card: '#FFFFFF', fill: '#F5F5F7', fill2: '#EBEBF0', border: '#E5E5EA',
  text: '#1C1C1E', secondary: '#8E8E93', muted: '#AEAEB2',
  accent: '#E11D48', accentBg: '#FFF1F2',
  success: '#10B981', successBg: '#ECFDF5',
  warning: '#F59E0B', warningBg: '#FFFBEB',
  danger: '#E11D48', dangerBg: '#FFF1F2',
  info: '#3B82F6', infoBg: '#EFF6FF',
  shadow: '0 1px 3px rgba(0,0,0,0.1)',
  shadowMd: '0 4px 6px rgba(0,0,0,0.1)',
  shadowLg: '0 20px 25px rgba(0,0,0,0.1)',
  font: "'Inter',system-ui,sans-serif",
};

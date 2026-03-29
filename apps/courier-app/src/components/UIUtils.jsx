import React from 'react';

/**
 * Modern Button Component with variants and sizes
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  loading = false,
  onClick,
  style = {},
  className = '',
  T,
}) => {
  const variantStyles = {
    primary: {
      base: { background: T.gradientAccent, color: '#fff' },
      shadow: `0 8px 24px ${T.red}30`,
    },
    secondary: {
      base: { background: T.fill, color: T.text, border: `1.5px solid ${T.border}` },
      shadow: 'none',
    },
    success: {
      base: { background: T.gradientSuccess, color: '#fff' },
      shadow: `0 8px 24px ${T.green}30`,
    },
    warning: {
      base: { background: T.gradientAmber, color: '#fff' },
      shadow: `0 8px 24px ${T.amber}30`,
    },
    ghost: {
      base: { background: 'transparent', color: T.text, border: `1.5px solid ${T.border}` },
      shadow: 'none',
    },
  };

  const sizeStyles = {
    sm: { height: 36, padding: '0 12px', fontSize: 13, borderRadius: 10 },
    md: { height: 44, padding: '0 18px', fontSize: 14, borderRadius: 12 },
    lg: { height: 52, padding: '0 24px', fontSize: 16, borderRadius: 14 },
  };

  const buttonVariant = variantStyles[variant] || variantStyles.primary;
  const buttonSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`press tap ${className}`}
      style={{
        ...buttonSize,
        ...buttonVariant.base,
        border: buttonVariant.base.border || 'none',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: buttonVariant.shadow,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...style,
      }}
    >
      {loading && <div className="sp" style={{ width: 16, height: 16 }} />}
      {!loading && icon && icon}
      {children}
    </button>
  );
};

/**
 * Modern Card Component
 */
export const Card = ({
  children,
  size = 'md',
  hoverable = false,
  onClick,
  style = {},
  className = '',
  T,
}) => {
  const sizeStyles = {
    sm: { padding: 12, borderRadius: 12 },
    md: { padding: 16, borderRadius: 14 },
    lg: { padding: 20, borderRadius: 16 },
  };

  const cardSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      onClick={onClick}
      className={hoverable ? 'card tap' : 'card'}
      style={{
        ...cardSize,
        background: T.card,
        boxShadow: T.shadow,
        border: `1px solid ${T.border}`,
        transition: 'all 0.3s cubic-bezier(0.2, 0.9, 0.3, 1)',
        cursor: hoverable ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Modern Input Component
 */
export const Input = ({
  placeholder,
  value,
  onChange,
  type = 'text',
  icon,
  error,
  disabled = false,
  style = {},
  T,
}) => {
  return (
    <div style={{ width: '100%' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              color: T.muted,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            height: 44,
            padding: icon ? '0 14px 0 40px' : '0 14px',
            borderRadius: 12,
            background: T.fill,
            border: `1.5px solid ${error ? T.red : T.border}`,
            fontSize: 14,
            fontWeight: 500,
            color: T.text,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: error ? `0 4px 12px ${T.red}20` : 'none',
            ...style,
          }}
        />
      </div>
      {error && (
        <p
          style={{
            fontSize: 12,
            color: T.red,
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Modern Badge Component
 */
export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  animated = false,
  T,
}) => {
  const variantStyles = {
    default: { bg: T.fill, color: T.sec },
    success: { bg: T.greenBg, color: T.green },
    warning: { bg: T.amberBg, color: T.amber },
    danger: { bg: T.redBg, color: T.red },
    info: { bg: T.blueBg, color: T.blue },
  };

  const sizeStyles = {
    sm: { padding: '3px 8px', fontSize: 11 },
    md: { padding: '4px 10px', fontSize: 12 },
    lg: { padding: '6px 14px', fontSize: 13 },
  };

  const style = variantStyles[variant] || variantStyles.default;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        borderRadius: 8,
        fontWeight: 700,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        animation: animated ? 'badgePulse 1.5s ease-in-out infinite' : 'none',
        ...style,
        ...sizeStyle,
      }}
    >
      {children}
    </span>
  );
};

/**
 * Modern Progress Bar Component
 */
export const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'primary',
  animated = true,
  label,
  T,
}) => {
  const percentage = (value / max) * 100;
  const colors = {
    primary: T.blue,
    success: T.green,
    warning: T.amber,
    danger: T.red,
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
            fontSize: 12,
            fontWeight: 600,
            color: T.sec,
          }}
        >
          <span>{label}</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: 8,
          borderRadius: 4,
          background: T.fill,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: colors[variant] || colors.primary,
            borderRadius: 4,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            animation: animated ? 'gradientShift 2s ease-in-out infinite' : 'none',
          }}
        />
      </div>
    </div>
  );
};

/**
 * Modern Alert Component
 */
export const Alert = ({
  message,
  variant = 'info',
  action,
  onClose,
  T,
}) => {
  const variantConfig = {
    success: { bg: T.greenBg, color: T.green, icon: '✓' },
    warning: { bg: T.amberBg, color: T.amber, icon: '!' },
    danger: { bg: T.redBg, color: T.red, icon: '✕' },
    info: { bg: T.blueBg, color: T.blue, icon: 'ⓘ' },
  };

  const config = variantConfig[variant] || variantConfig.info;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        background: config.bg,
        border: `1px solid ${config.color}40`,
        animation: 'slideDown 0.3s ease',
      }}
    >
      <span style={{ color: config.color, fontWeight: 700, fontSize: 16 }}>
        {config.icon}
      </span>
      <span
        style={{
          flex: 1,
          color: config.color,
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {message}
      </span>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            border: 'none',
            background: 'transparent',
            color: config.color,
            fontWeight: 700,
            fontSize: 12,
            padding: '4px 8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {action.label}
        </button>
      )}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            color: config.color,
            fontSize: 16,
            cursor: 'pointer',
            padding: 0,
            opacity: 0.5,
            transition: 'opacity 0.2s ease',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

/**
 * Modern Divider Component
 */
export const Divider = ({ label, T }) => {
  if (!label) {
    return (
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${T.border}, transparent)`,
          margin: '16px 0',
        }}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '16px 0',
      }}
    >
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ color: T.sec, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
};

/**
 * Modern Stat Card Component
 */
export const StatCard = ({
  label,
  value,
  icon,
  trend,
  color,
  size = 'md',
  T,
}) => {
  const sizeStyles = {
    sm: { padding: 12, borderRadius: 12 },
    md: { padding: 16, borderRadius: 14 },
    lg: { padding: 20, borderRadius: 16 },
  };

  return (
    <Card size={size} T={T}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        {icon && (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              fontSize: 20,
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: T.sec,
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            {label}
          </p>
          <p
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: T.text,
              margin: '4px 0 0',
            }}
          >
            {value}
          </p>
          {trend && (
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: trend > 0 ? T.green : T.red,
                margin: '4px 0 0',
              }}
            >
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last period
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default {
  Button,
  Card,
  Input,
  Badge,
  ProgressBar,
  Alert,
  Divider,
  StatCard,
};

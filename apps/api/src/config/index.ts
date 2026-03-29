import 'dotenv/config';

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '3001'), 10),
  apiBaseUrl: optional('API_BASE_URL', 'http://localhost:3001'),

  cors: {
    origins: optional('CORS_ORIGINS', 'http://localhost:5173').split(',').map(s => s.trim()),
  },

  db: {
    url: optional('DATABASE_URL', ''),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
  },

  jwt: {
    accessSecret: optional('JWT_ACCESS_SECRET', 'dev_access_secret_change_in_prod'),
    refreshSecret: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_prod'),
    accessExpiry: optional('JWT_ACCESS_EXPIRY', '15m'),
    refreshExpiry: optional('JWT_REFRESH_EXPIRY', '30d'),
  },

  otp: {
    ttlSeconds: parseInt(optional('OTP_TTL_SECONDS', '180'), 10),
    maxAttempts: parseInt(optional('OTP_MAX_ATTEMPTS', '5'), 10),
    length: parseInt(optional('OTP_LENGTH', '6'), 10),
  },

  google: {
    clientId: optional('GOOGLE_CLIENT_ID', ''),
    clientSecret: optional('GOOGLE_CLIENT_SECRET', ''),
    callbackUrl: optional('GOOGLE_CALLBACK_URL', 'http://localhost:3001/api/v1/auth/google/callback'),
  },

  sms: {
    arkeselApiKey: optional('ARKESEL_API_KEY', ''),
    arkeselSenderId: optional('ARKESEL_SENDER_ID', 'LocQar'),
  },

  whatsapp: {
    accessToken: optional('WHATSAPP_ACCESS_TOKEN', ''),
    phoneNumberId: optional('WHATSAPP_PHONE_NUMBER_ID', ''),
  },

  momo: {
    subscriptionKey: optional('MTN_MOMO_SUBSCRIPTION_KEY', ''),
    apiUser: optional('MTN_MOMO_API_USER', ''),
    apiKey: optional('MTN_MOMO_API_KEY', ''),
    environment: optional('MTN_MOMO_ENVIRONMENT', 'sandbox') as 'sandbox' | 'production',
  },

  telecel: {
    apiKey: optional('TELECEL_CASH_API_KEY', ''),
    merchantId: optional('TELECEL_CASH_MERCHANT_ID', ''),
  },

  winnsen: {
    // URL we call for cloud API actions (SetPinCode, GetTerminalInfo, etc.)
    cloudApiBase: optional('WINNSEN_CLOUD_API_BASE', 'https://cloud.winnsen.com/logistics3/api2'),
    // APIKey provided by Winnsen — sent in every cloud request body
    apiKey: optional('WINNSEN_API_KEY', ''),
    // Secret the kiosk hardware sends as x-api-key when calling our /api/winnsen/events
    inboundApiKey: optional('WINNSEN_INBOUND_API_KEY', ''),
  },

  storage: {
    provider: optional('STORAGE_PROVIDER', 'local') as 'local' | 's3',
    awsBucket: optional('AWS_BUCKET_NAME', ''),
    awsRegion: optional('AWS_REGION', 'eu-west-1'),
    awsAccessKeyId: optional('AWS_ACCESS_KEY_ID', ''),
    awsSecretAccessKey: optional('AWS_SECRET_ACCESS_KEY', ''),
    maxFileSizeMb: parseInt(optional('MAX_FILE_SIZE_MB', '10'), 10),
  },

  ghana: {
    ssnitEmployeeRate: parseFloat(optional('SSNIT_EMPLOYEE_RATE', '0.055')),
    ssnitEmployerRate: parseFloat(optional('SSNIT_EMPLOYER_RATE', '0.13')),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    maxGeneral: parseInt(optional('RATE_LIMIT_MAX_GENERAL', '200'), 10),
    maxAuth: parseInt(optional('RATE_LIMIT_MAX_AUTH', '20'), 10),
    maxOtp: parseInt(optional('RATE_LIMIT_MAX_OTP', '5'), 10),
  },

  log: {
    level: optional('LOG_LEVEL', 'debug'),
  },

  urls: {
    admin: optional('ADMIN_PORTAL_URL', 'http://localhost:5173'),
    courier: optional('COURIER_APP_URL', 'http://localhost:5176'),
    customer: optional('CUSTOMER_APP_URL', 'http://localhost:5177'),
    website: optional('WEBSITE_URL', 'http://localhost:3000'),
  },
} as const;

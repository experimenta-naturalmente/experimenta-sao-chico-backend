import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ?? '',
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '',
  minio: {
    endpoint: required('MINIO_ENDPOINT', 'http://minio:9000'),
    accessKey: required('MINIO_ACCESS_KEY', 'minioadmin'),
    secretKey: required('MINIO_SECRET_KEY', 'minioadmin'),
    bucket: required('MINIO_BUCKET', 'turismo-rural'),
    region: required('MINIO_REGION', 'us-east-1'),
    publicUrl: required('MINIO_PUBLIC_URL', 'http://localhost:9000').replace(/\/+$/, ''),
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  requireAuth: (process.env.REQUIRE_AUTH ?? 'false').toLowerCase() === 'true',
};

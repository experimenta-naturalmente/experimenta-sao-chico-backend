import {
  S3Client,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from './env';

// Cliente S3 apontando para o MinIO. forcePathStyle é obrigatório no MinIO.
export const s3 = new S3Client({
  endpoint: env.minio.endpoint,
  region: env.minio.region,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.minio.accessKey,
    secretAccessKey: env.minio.secretKey,
  },
});

function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-.]/g, '');
}

export async function uploadObject(
  buffer: Buffer,
  originalName: string,
  contentType: string,
): Promise<string> {
  const key = `uploads/${Date.now()}-${sanitizeFilename(originalName)}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.minio.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read',
    }),
  );

  return `${env.minio.publicUrl}/${env.minio.bucket}/${key}`;
}

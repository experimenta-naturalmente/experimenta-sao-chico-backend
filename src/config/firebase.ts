import admin from 'firebase-admin';
import fs from 'fs';
import { env } from './env';

function buildCredential(): admin.credential.Credential {
  if (env.firebaseServiceAccount.trim().length > 0) {
    try {
      const parsed = JSON.parse(env.firebaseServiceAccount);
      return admin.credential.cert(parsed as admin.ServiceAccount);
    } catch (e) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT não é um JSON válido. Cole o conteúdo da service account.',
      );
    }
  }

  if (
    env.googleApplicationCredentials.trim().length > 0 &&
    fs.existsSync(env.googleApplicationCredentials)
  ) {
    const raw = fs.readFileSync(env.googleApplicationCredentials, 'utf-8');
    return admin.credential.cert(JSON.parse(raw) as admin.ServiceAccount);
  }

  // Usa Application Default Credentials (ex.: ambiente GCP)
  return admin.credential.applicationDefault();
}

if (admin.apps.length === 0) {
  admin.initializeApp({ credential: buildCredential() });
}

export const db = admin.firestore();
export const auth = admin.auth();
export { admin };

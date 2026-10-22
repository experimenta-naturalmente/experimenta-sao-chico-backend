import { NextFunction, Request, Response } from 'express';
import { auth } from '../config/firebase';
import { env } from '../config/env';

export interface AuthedRequest extends Request {
  uid?: string;
}

// Valida o Firebase ID token (Authorization: Bearer <token>) nas rotas de escrita.
// Se REQUIRE_AUTH=false, apenas tenta decodificar mas não bloqueia.
export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    if (env.requireAuth) {
      res.status(401).json({ error: 'Token de autenticação ausente.' });
      return;
    }
    next();
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch (_e) {
    if (env.requireAuth) {
      res.status(401).json({ error: 'Token de autenticação inválido.' });
      return;
    }
    next();
  }
}

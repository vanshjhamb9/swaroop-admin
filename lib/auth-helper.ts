import { NextRequest } from 'next/server';
import { adminAuth } from '../app/api/firebaseadmin';

export interface AuthTokenPayload {
  uid: string;
  email?: string;
  phone_number?: string;
  admin?: boolean;
  dealeradmin?: boolean;
}

export async function verifyAuthToken(request: NextRequest): Promise<AuthTokenPayload> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(token);
  
  return decodedToken as AuthTokenPayload;
}

export function requireAdmin(decodedToken: AuthTokenPayload): void {
  if (!decodedToken.admin) {
    throw new Error('Admin access required');
  }
}

export function requireAdminOrDealer(decodedToken: AuthTokenPayload): void {
  if (!decodedToken.admin && !decodedToken.dealeradmin) {
    throw new Error('Admin or dealer access required');
  }
}

export function requireSelfOrAdmin(decodedToken: AuthTokenPayload, userId: string): void {
  if (decodedToken.uid !== userId && !decodedToken.admin) {
    throw new Error('Unauthorized to access this resource');
  }
}

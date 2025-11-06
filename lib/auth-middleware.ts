import { adminAuth } from '../app/api/firebaseadmin';

export interface AuthenticatedRequest {
  headers: any;
  user?: {
    uid: string;
    email?: string;
    claims?: {
      admin?: boolean;
      dealeradmin?: boolean;
    };
  };
}

export async function verifyFirebaseToken(req: any): Promise<{
  success: boolean;
  user?: any;
  error?: string;
}> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header'
      };
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        claims: {
          admin: decodedToken.admin || false,
          dealeradmin: decodedToken.dealeradmin || false
        }
      }
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      error: 'Invalid or expired token'
    };
  }
}

export function requireAuth(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: any) => {
    const authResult = await verifyFirebaseToken(req);
    
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }
    
    req.user = authResult.user;
    return handler(req, res);
  };
}

export function requireAdmin(handler: (req: any, res: any) => Promise<void>) {
  return async (req: any, res: any) => {
    const authResult = await verifyFirebaseToken(req);
    
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }
    
    if (!authResult.user?.claims?.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = authResult.user;
    return handler(req, res);
  };
}

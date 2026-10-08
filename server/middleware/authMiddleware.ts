import { NextFunction, Request, Response } from 'express';
import { supabaseService } from '../supabase.ts';

export interface AuthenticatedRequest extends Request {
  authUser?: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken?: string;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required. Please sign in to access SkillQuest.',
      });
    }

    const token = authHeader.slice(7).trim();
    const verifiedUser = await supabaseService.verifyAccessToken(token);

    if (!verifiedUser) {
      return res.status(401).json({
        error: 'Your session has expired or is invalid. Please sign in again.',
      });
    }

    req.authUser = verifiedUser;
    req.accessToken = token;
    next();
  } catch (err) {
    console.error('[AuthMiddleware] Token verification error:', err);
    return res.status(401).json({
      error: 'Unable to verify authentication session.',
    });
  }
};

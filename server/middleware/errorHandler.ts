import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('[SkillQuest API Error]:', err.message);
  res.status(500).json({
    error: 'An unexpected server error occurred. Please try again.',
  });
};

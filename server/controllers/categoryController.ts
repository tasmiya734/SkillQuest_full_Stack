import { Request, Response } from 'express';
import { CATEGORIES } from '../config/constants.ts';

export const getCategories = (req: Request, res: Response) => {
  const track = req.query.track as string | undefined;
  if (track === 'programming' || track === 'domain') {
    return res.json({
      categories: CATEGORIES.filter((c) => c.track === track),
    });
  }
  return res.json({ categories: CATEGORIES });
};

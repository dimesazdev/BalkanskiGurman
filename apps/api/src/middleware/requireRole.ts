import { Request, Response, NextFunction } from 'express';

export default function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({ error: 'Forbidden: insufficient privileges' });
      return;
    }
    next();
  };
}
import { Request, Response, NextFunction } from 'express';

export default function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      res.status(403).json({ error: 'Forbidden: missing role' });
      return;
    }

    const userRole = req.user.role.toLowerCase();
    if (userRole !== requiredRole.toLowerCase()) {
      res.status(403).json({ error: 'Forbidden: insufficient privileges' });
      return;
    }

    next();
  };
}
import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog';

export const auditLogMiddleware = (resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only log write actions
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      // Capture the original send to intercept the response status
      const originalSend = res.send;
      res.send = function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Success, log it
          const action = getActionFromMethod(req.method);
          const userId = (req as any).user?._id; // Assumes authMiddleware has run
          
          if (userId) {
            AuditLog.create({
              user: userId,
              action,
              resource,
              details: JSON.stringify({
                path: req.path,
                query: req.query,
                body: req.method !== 'DELETE' ? req.body : undefined
              })
            }).catch(err => console.error('Failed to write audit log:', err));
          }
        }
        return originalSend.apply(this, arguments as any);
      };
    }
    next();
  };
};

function getActionFromMethod(method: string): string {
  switch (method) {
    case 'POST': return 'CREATE';
    case 'PUT':
    case 'PATCH': return 'UPDATE';
    case 'DELETE': return 'DELETE';
    default: return 'UNKNOWN';
  }
}

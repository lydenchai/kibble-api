import { Router, Request, Response } from 'express';
import { sseService } from '../services/sse.service';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send an initial heartbeat
  res.write(': heartbeat\n\n');

  const clientId = Date.now().toString();
  sseService.addClient(clientId, res);

  req.on('close', () => {
    sseService.removeClient(clientId);
  });
});

export default router;

import { v4 as uuidv4 } from 'uuid';

export class CorrelationIdMiddleware {
  use(req: any, res: any, next: any) {
    const incoming = req.headers['x-correlation-id'];
    const correlationId = (typeof incoming === 'string' && incoming.trim()) ? incoming : uuidv4();
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}

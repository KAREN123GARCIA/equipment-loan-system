import { randomUUID } from "crypto";
import pinoHttp from "pino-http";

export const CORRELATION_HEADER = "x-correlation-id";

export function CorrelationIdMiddleware() {
  return pinoHttp({
    genReqId: (req, res) => {
      const existing = (req.headers[CORRELATION_HEADER] as string | undefined)?.trim();
      const id = existing || randomUUID();
      res.setHeader(CORRELATION_HEADER, id);
      return id;
    },
    customProps: (req) => ({ correlationId: (req as any).id }),
    serializers: {
      req(req) { return { id:(req as any).id, method:req.method, url:req.url, headers:{ authorization:req.headers.authorization?"***":undefined, [CORRELATION_HEADER]:req.headers[CORRELATION_HEADER] } }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  });
}

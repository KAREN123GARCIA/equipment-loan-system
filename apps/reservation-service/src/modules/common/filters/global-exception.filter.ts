import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { CORRELATION_HEADER } from "../middleware/correlation-id.middleware";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const correlationId = (res.getHeader(CORRELATION_HEADER) as string) || (req.headers[CORRELATION_HEADER] as string) || undefined;

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttp ? exception.getResponse() : undefined;
    const message = typeof payload === "string" ? payload : (payload as any)?.message || exception?.message || "Unexpected error";
    const details = typeof payload === "object" && payload ? (payload as any).details : undefined;

    res.status(status).json({
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method,
      correlationId,
      error: HttpStatus[status] ?? "Error",
      message,
      details,
    });
  }
}

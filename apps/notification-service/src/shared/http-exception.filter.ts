import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : 500;
    const response = isHttp ? exception.getResponse() : { message: 'Internal Server Error' };
    const payload = typeof response === 'string' ? { message: response } : response;

    this.logger.error('request_failed', {
      status,
      path: req?.url,
      method: req?.method,
      correlationId: req?.correlationId,
      payload,
      err: { message: exception?.message, stack: exception?.stack },
    });

    res.status(status).json({
      statusCode: status,
      ...payload,
      correlationId: req?.correlationId,
      timestamp: new Date().toISOString(),
      path: req?.url,
    });
  }
}

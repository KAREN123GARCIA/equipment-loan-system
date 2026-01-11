import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'notification-service' },
  });

  log(message: any, ...optionalParams: any[]) { this.logger.info({ msg: message, params: optionalParams }); }
  error(message: any, ...optionalParams: any[]) { this.logger.error({ msg: message, err: optionalParams?.[0] }); }
  warn(message: any, ...optionalParams: any[]) { this.logger.warn({ msg: message, params: optionalParams }); }
  debug(message: any, ...optionalParams: any[]) { this.logger.debug({ msg: message, params: optionalParams }); }
  verbose(message: any, ...optionalParams: any[]) { this.logger.trace({ msg: message, params: optionalParams }); }

  info(obj: any) { this.logger.info(obj); }
}

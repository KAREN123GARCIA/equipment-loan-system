import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { MailerService } from './mailer.service';
import { TemplateEngine } from './template-engine';

@Global()
@Module({
  providers: [LoggerService, MailerService, TemplateEngine],
  exports: [LoggerService, MailerService, TemplateEngine],
})
export class SharedModule {}

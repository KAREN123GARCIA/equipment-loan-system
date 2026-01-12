import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";
import { AppConfigModule } from "../config/app-config.module";
import { AppConfigService } from "../config/app-config.service";

@Module({
  imports: [
    AppConfigModule,
    HttpModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (cfg: AppConfigService) => ({
        timeout: cfg.httpTimeoutMs(),
        maxRedirects: 0,
      }),
    }),
  ],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}

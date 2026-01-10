import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";

import { AppConfigService } from "../modules/config/app-config.service";
import { JwtStrategy } from "../modules/authz/jwt.strategy";

import { PrismaModule } from "./prisma/prisma.module";
import { LoansModule } from "./loans/loans.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    PrismaModule,
    LoansModule,
  ],
  providers: [AppConfigService, JwtStrategy],
})
export class AppModule {}

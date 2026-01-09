import { Module } from "@nestjs/common";
import { AppConfigModule } from "./config/app-config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthzModule } from "./authz/authz.module";
import { LoansModule } from "./loans/loans.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [AppConfigModule, PrismaModule, AuthzModule, LoansModule, HealthModule],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { HealthModule } from "./common/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CasesModule } from "./modules/cases/cases.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ServicesModule } from "./modules/services/services.module";

@Module({
  imports: [
    HealthModule,
    AuthModule,
    CasesModule,
    DashboardModule,
    ServicesModule,
  ],
})
export class AppModule {}

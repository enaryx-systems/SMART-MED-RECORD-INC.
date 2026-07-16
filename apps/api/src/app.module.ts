import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { CasesController } from './cases/cases.controller';
import { CasesService } from './cases/cases.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { HealthController } from './health.controller';
import { ServicesController } from './services/services.controller';

@Module({
  controllers: [HealthController, AuthController, CasesController, DashboardController, ServicesController],
  providers: [CasesService],
})
export class AppModule {}

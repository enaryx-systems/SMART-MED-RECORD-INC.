import { Module } from "@nestjs/common";
import { CasesModule } from "../cases/cases.module";
import { DashboardController } from "./dashboard.controller";

@Module({
  imports: [CasesModule],
  controllers: [DashboardController],
})
export class DashboardModule {}

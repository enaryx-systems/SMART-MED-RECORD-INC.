import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { HealthModule } from "./common/health/health.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { AuditModule } from "./common/audit/audit.module";
import { JwtAuthGuard } from "./common/auth/jwt-auth.guard";
import { RolesGuard } from "./common/auth/roles.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { CasesModule } from "./modules/cases/cases.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { MessagesModule } from "./modules/messages/messages.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ServicesModule } from "./modules/services/services.module";

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CasesModule,
    DocumentsModule,
    MessagesModule,
    InvoicesModule,
    DashboardModule,
    ServicesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

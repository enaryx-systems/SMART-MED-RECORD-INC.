import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { PrismaModule } from "./common/prisma/prisma.module";
import { StorageModule } from "./common/storage/storage.module";
import { QueueModule } from "./common/queue/queue.module";
import { RealtimeModule } from "./common/realtime/realtime.module";
import { EmailModule } from "./common/email/email.module";
import { ClerkModule } from "./common/auth/clerk.module";
import { ClerkAuthGuard } from "./common/auth/clerk-auth.guard";
import { RolesGuard } from "./common/auth/roles.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { CasesModule } from "./modules/cases/cases.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { UsersModule } from "./modules/users/users.module";
import { InvoicesModule } from "./modules/invoices/invoices.module";
import { AiModule } from "./modules/ai/ai.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    QueueModule,
    RealtimeModule,
    EmailModule,
    ClerkModule,
    AuthModule,
    CasesModule,
    DocumentsModule,
    OrganizationsModule,
    UsersModule,
    InvoicesModule,
    AiModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ClerkAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

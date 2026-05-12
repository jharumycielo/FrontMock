import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { IdentityModule } from './identity/identity.module';
import { OrganizationModule } from './organization/organization.module';
import { RequestsModule } from './requests/requests.module';
import { ChartAccountsModule } from './chart-accounts/chart-accounts.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    IdentityModule,
    OrganizationModule,
    RequestsModule,
    ChartAccountsModule,
    DocumentsModule,
    NotificationsModule,
    WhatsappModule,
    // módulos futuros:
    // RequestsModule,
    // ChartAccountsModule,
    // DocumentsModule,
    // AuditModule,
  ],
})
export class AppModule {}

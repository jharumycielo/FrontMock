import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // módulos futuros:
    // AuthModule,
    // IdentityModule,
    // OrganizationModule,
    // RequestsModule,
    // ChartAccountsModule,
    // DocumentsModule,
    // AuditModule,
  ],
})
export class AppModule {}

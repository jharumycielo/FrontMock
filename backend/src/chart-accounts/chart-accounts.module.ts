import { Module } from '@nestjs/common';
import { ChartAccountsService } from './chart-accounts.service';
import { ChartAccountsController } from './chart-accounts.controller';

@Module({
  controllers: [ChartAccountsController],
  providers: [ChartAccountsService],
  exports: [ChartAccountsService],
})
export class ChartAccountsModule {}

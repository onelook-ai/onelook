import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { GenAIModule } from '../gen-ai/gen-ai.module';

@Module({
  imports: [GenAIModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

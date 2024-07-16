import { Module } from '@nestjs/common';
import { AnalysisResultsController } from './analysis-results.controller';
import { AnalysisResultsService } from './analysis-results.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResultsEntity } from 'src/modules/analysis-results/analysis-results.entity';
import { StorageModule } from 'src/modules/storage/storage.module';
import { SessionVideoContextsModule } from 'src/modules/session-video-contexts/session-video-contexts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalysisResultsEntity]),
    StorageModule,
    SessionVideoContextsModule,
  ],
  controllers: [AnalysisResultsController],
  providers: [AnalysisResultsService],
  exports: [AnalysisResultsService],
})
export class AnalysisResultsModule {}

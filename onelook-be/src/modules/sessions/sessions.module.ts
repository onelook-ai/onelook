import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisResultsEntity } from 'src/modules/analysis-results/analysis-results.entity';
import { SessionVideoContextEntity } from 'src/modules/session-video-contexts/session-video-contexts.entity';
import { SessionsController } from 'src/modules/sessions/sessions.controller';
import { SessionEntity } from 'src/modules/sessions/sessions.entity';
import { SessionsService } from 'src/modules/sessions/sessions.service';
import { StorageModule } from 'src/modules/storage/storage.module';
import { VideoProcessingModule } from 'src/modules/video-processing/video-processing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SessionEntity,
      AnalysisResultsEntity,
      SessionVideoContextEntity,
    ]),
    StorageModule,
    VideoProcessingModule,
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
